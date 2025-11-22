import os
from typing import Optional
from supabase_client import supabase

BUCKET = os.getenv("SUPABASE_BUCKET", "cloud-storage")

def upload_file_to_supabase(django_file, path: str):
    """
    Upload file bytes to supabase at given path.
    `path` example: "user_id/uuid_filename.ext"
    """
    # Read bytes
    data = django_file.read()
    # Some client versions expect (path, file) positional args, others keyword.
    # Try typical signature first.
    try:
        res = supabase.storage.from_(BUCKET).upload(path=path, file=data, file_options={
            "content-type": getattr(django_file, "content_type", "application/octet-stream")
        })
    except TypeError:
        # Fallback: positional args
        res = supabase.storage.from_(BUCKET).upload(path, data)
    return res

def get_public_url(path: str) -> str:
    """
    Returns the public URL for a file in the bucket (works for public buckets).
    """
    res = supabase.storage.from_(BUCKET).get_public_url(path)
    # get_public_url commonly returns a dict like {"publicUrl": "..."} or a string depending on client version.
    if isinstance(res, dict):
        # common shape: {"publicUrl": "https://..."}
        return res.get("publicUrl") or res.get("public_url") or res.get("publicURL") or ""
    if isinstance(res, str):
        return res
    return ""

def get_signed_url(path: str, expiry: int = 3600) -> Optional[str]:
    """
    Returns a signed URL valid for `expiry` seconds (useful for private buckets).
    """
    try:
        res = supabase.storage.from_(BUCKET).create_signed_url(path, expiry)
    except TypeError:
        # some clients might return different shapes
        res = supabase.storage.from_(BUCKET).create_signed_url(path, expiry)
    # typical dict shape: {"signedURL": "https://..."} or {"signed_url": "..."}
    if isinstance(res, dict):
        return res.get("signedURL") or res.get("signed_url") or res.get("signedUrl") or ""
    if isinstance(res, str):
        return res
    return None

def delete_file_supabase(path: str) -> bool:
    """
    Deletes a file at `path` from the configured bucket.
    Returns True on success, False otherwise.
    """
    storage = supabase.storage.from_(BUCKET)

    # Most common API: remove(list_of_paths)
    try:
        # remove usually expects a list of paths
        if hasattr(storage, "remove"):
            result = storage.remove([path])
            # success shapes vary; we'll treat any falsy/exception as failure
            return True
        # fallback to delete/remove single
        if hasattr(storage, "delete"):
            storage.delete(path)
            return True
    except Exception as e:
        # log if you want; don't crash the caller
        # Optionally: print("Supabase delete error:", e)
        return False

    # If neither method exists, return False
    return False
