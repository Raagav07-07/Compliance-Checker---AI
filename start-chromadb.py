#!/usr/bin/env python3
"""
ChromaDB Standalone Server Launcher
Provides an easy way to run ChromaDB without Docker
"""

import subprocess
import sys
import os
import shutil
import site


def check_chromadb_installed():
    """Check if chromadb package is installed"""
    try:
        import chromadb

        return True
    except ImportError:
        return False


def main():
    print("=" * 60)
    print("ChromaDB Standalone Server Launcher")
    print("=" * 60)

    # Check if chromadb is installed
    if not check_chromadb_installed():
        print("\n❌ ChromaDB is not installed!")
        print("\nInstalling chromadb...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "chromadb"])
        print("✅ ChromaDB installed successfully\n")

    # Create data directory if it doesn't exist
    data_dir = "./chroma-data"
    os.makedirs(data_dir, exist_ok=True)

    # Start ChromaDB server
    print(f"\n🚀 Starting ChromaDB server...")
    print(f"📁 Data directory: {os.path.abspath(data_dir)}")
    print(f"🌐 Server URL: http://localhost:8000")
    print("\n" + "=" * 60)
    print("Press Ctrl+C to stop the server")
    print("=" * 60 + "\n")

    try:
        chroma_path = shutil.which("chroma")
        if not chroma_path:
            user_scripts = os.path.join(site.USER_BASE, "Scripts", "chroma.exe")
            venv_scripts = os.path.join(sys.prefix, "Scripts", "chroma.exe")
            for candidate in (user_scripts, venv_scripts):
                if os.path.exists(candidate):
                    chroma_path = candidate
                    break

        if chroma_path:
            subprocess.run(
                [
                    chroma_path,
                    "run",
                    "--path",
                    data_dir,
                    "--port",
                    "8000",
                ]
            )
        else:
            raise FileNotFoundError(
                "Chroma CLI not found. Ensure it is installed and on PATH."
            )
    except KeyboardInterrupt:
        print("\n\n✅ ChromaDB server stopped")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
