#!/usr/bin/env python3
"""
GitHub single-file committer.

Creates one commit per file via GitHub Contents API.
"""

from __future__ import annotations

import argparse
import base64
import hashlib
import json
import os
import time
from pathlib import Path
from typing import Dict, Optional, Tuple, Union
from urllib import error, parse, request

FileContent = Union[str, bytes]


class GitHubCommitter:
    """Handles one-file commits to a GitHub repository."""

    def __init__(
        self,
        token: str,
        repo_owner: str,
        repo_name: str,
        branch: str = "main",
        timeout_seconds: int = 30,
        max_retries: int = 3,
        retry_backoff_seconds: float = 0.8,
        author_name: Optional[str] = None,
        author_email: Optional[str] = None,
    ) -> None:
        self.repo_owner = repo_owner
        self.repo_name = repo_name
        self.branch = branch
        self.base_url = "https://api.github.com"
        self.timeout_seconds = timeout_seconds
        self.max_retries = max_retries
        self.retry_backoff_seconds = retry_backoff_seconds
        self.author_name = author_name
        self.author_email = author_email
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "Content-Type": "application/json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "github-atomic-committer",
        }

    def _request(
        self,
        method: str,
        url: str,
        payload: Optional[Dict] = None,
        params: Optional[Dict] = None,
    ) -> Tuple[int, Dict[str, str], str]:
        if params:
            query = parse.urlencode(params)
            url = f"{url}?{query}"

        data = None
        if payload is not None:
            data = json.dumps(payload).encode("utf-8")

        req = request.Request(url=url, data=data, headers=self.headers, method=method)

        try:
            with request.urlopen(req, timeout=self.timeout_seconds) as response:
                status = response.status
                headers = dict(response.headers.items())
                body = response.read().decode("utf-8", errors="replace")
                self._raise_if_rate_limited(status, headers)
                return status, headers, body
        except error.HTTPError as exc:
            status = exc.code
            headers = dict(exc.headers.items()) if exc.headers else {}
            body = exc.read().decode("utf-8", errors="replace")
            self._raise_if_rate_limited(status, headers)
            return status, headers, body

    @staticmethod
    def _to_bytes(content: FileContent) -> bytes:
        if isinstance(content, bytes):
            return content
        return content.encode("utf-8")

    @staticmethod
    def _calculate_git_blob_sha(content_bytes: bytes) -> str:
        header = f"blob {len(content_bytes)}\0".encode("utf-8")
        sha1 = hashlib.sha1()
        sha1.update(header)
        sha1.update(content_bytes)
        return sha1.hexdigest()

    @staticmethod
    def _parse_json(body: str) -> Dict:
        if not body:
            return {}
        try:
            return json.loads(body)
        except json.JSONDecodeError:
            return {}

    @staticmethod
    def _raise_if_rate_limited(status: int, headers: Dict[str, str]) -> None:
        if status == 403 and headers.get("X-RateLimit-Remaining") == "0":
            reset_ts = headers.get("X-RateLimit-Reset", "unknown")
            raise RuntimeError(f"GitHub API rate limit exceeded. Reset epoch: {reset_ts}")

    def _get_file_sha(self, file_path: str) -> Optional[str]:
        url = f"{self.base_url}/repos/{self.repo_owner}/{self.repo_name}/contents/{file_path}"
        status, _, body = self._request("GET", url, params={"ref": self.branch})

        if status == 200:
            payload = self._parse_json(body)
            return payload.get("sha")
        if status == 404:
            return None

        raise RuntimeError(f"Failed to fetch '{file_path}' SHA: {status} {body}")

    def commit_single_file(
        self,
        file_path: str,
        file_content: FileContent,
        commit_message: str,
        is_update: Optional[bool] = None,
        is_binary: bool = False,
    ) -> dict:
        content_bytes = self._to_bytes(file_content)
        local_sha = self._calculate_git_blob_sha(content_bytes)
        encoded_content = base64.b64encode(content_bytes).decode("utf-8")

        for attempt in range(self.max_retries + 1):
            existing_sha = self._get_file_sha(file_path)
            should_update = existing_sha is not None if is_update is None else is_update

            if should_update and existing_sha == local_sha:
                return {
                    "success": True,
                    "commit_sha": existing_sha,
                    "message": f"{file_path} is already up to date",
                    "action": "skipped",
                    "commit_url": "",
                    "path": file_path,
                    "is_binary": is_binary,
                }

            body = {
                "message": commit_message,
                "content": encoded_content,
                "branch": self.branch,
            }

            if should_update and existing_sha:
                body["sha"] = existing_sha

            if self.author_name and self.author_email:
                author = {"name": self.author_name, "email": self.author_email}
                body["author"] = author
                body["committer"] = author

            url = (
                f"{self.base_url}/repos/{self.repo_owner}/"
                f"{self.repo_name}/contents/{file_path}"
            )
            status, _, response_body = self._request("PUT", url, payload=body)

            if status in (200, 201):
                payload = self._parse_json(response_body)
                commit = payload.get("commit", {})
                return {
                    "success": True,
                    "commit_sha": commit.get("sha", ""),
                    "message": f"Committed {file_path}",
                    "action": "updated" if should_update else "created",
                    "commit_url": commit.get("html_url", ""),
                    "path": file_path,
                    "is_binary": is_binary,
                }

            if status == 409 and attempt < self.max_retries:
                sleep_for = self.retry_backoff_seconds * (attempt + 1)
                time.sleep(sleep_for)
                continue

            if status == 401:
                raise RuntimeError("Unauthorized: invalid token or missing repo permission")
            if status == 404:
                raise RuntimeError(
                    "Not found: repository or file path unavailable to this token"
                )
            if status == 422:
                raise RuntimeError(f"Validation failed: {response_body}")

            raise RuntimeError(
                f"Commit failed for '{file_path}': {status} {response_body}"
            )

        raise RuntimeError(f"Conflict while committing '{file_path}' after retries")

    def commit_file_from_disk(
        self,
        local_path: str,
        repo_path: Optional[str] = None,
        commit_message: Optional[str] = None,
    ) -> dict:
        path = Path(local_path)
        content_bytes = path.read_bytes()
        try:
            text_content = content_bytes.decode("utf-8")
            payload: FileContent = text_content
            is_binary = False
        except UnicodeDecodeError:
            payload = content_bytes
            is_binary = True

        repo_target = repo_path or path.name
        message = commit_message or f"chore: update {repo_target}"
        return self.commit_single_file(repo_target, payload, message, is_binary=is_binary)


def _parse_repo(repo: str) -> tuple[str, str]:
    if "/" not in repo:
        raise ValueError("--repo must be in 'owner/name' format")
    owner, name = repo.split("/", 1)
    if not owner or not name:
        raise ValueError("--repo must be in 'owner/name' format")
    return owner, name


def main() -> None:
    parser = argparse.ArgumentParser(description="Commit one file to GitHub via API.")
    parser.add_argument("--repo", default=os.getenv("GITHUB_REPO"), help="owner/name")
    parser.add_argument("--branch", default=os.getenv("GITHUB_BRANCH", "main"))
    parser.add_argument("--token", default=os.getenv("GITHUB_TOKEN"))
    parser.add_argument("--file", required=True, help="Local file path")
    parser.add_argument("--repo-path", help="Destination path in repository")
    parser.add_argument("--message", help="Commit message")
    args = parser.parse_args()

    if not args.token:
        raise SystemExit("Missing token. Set GITHUB_TOKEN or pass --token.")
    if not args.repo:
        raise SystemExit("Missing repository. Set GITHUB_REPO or pass --repo owner/name.")

    owner, name = _parse_repo(args.repo)
    committer = GitHubCommitter(
        token=args.token,
        repo_owner=owner,
        repo_name=name,
        branch=args.branch,
    )

    result = committer.commit_file_from_disk(
        local_path=args.file,
        repo_path=args.repo_path,
        commit_message=args.message,
    )
    print(f"{result['action']}: {result['path']} -> {result['commit_sha'][:7]}")
    if result["commit_url"]:
        print(result["commit_url"])


if __name__ == "__main__":
    main()
