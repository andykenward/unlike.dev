# Microsoft's Ubuntu 24.04 dev container base — the OS of GitHub's ubuntu-slim
# runner — pinned by digest. It ships zsh + Oh My Zsh and the non-root `vscode`
# user (UID 1000), and builds an up-to-date git from source, so local git
# matches CI instead of lagging at the distro's release.
FROM mcr.microsoft.com/devcontainers/base:3.0.12-noble@sha256:ec556aed93f62aa6d13fe72c5db09da4e29a7c9b87c568dbca0ee5717466926a

# Mount points for the named volumes in devcontainer.json (Claude Code state,
# gh CLI auth, zsh history). A volume whose mount point is missing from the
# image is created root-owned, and the first write fails with EACCES. ~/.config
# is chowned too, since mkdir -p creates it as root.
RUN mkdir -p /home/vscode/.claude /home/vscode/.agents /home/vscode/.config/gh /home/vscode/.commandhistory \
    && chown -R vscode:vscode /home/vscode/.claude /home/vscode/.agents /home/vscode/.config /home/vscode/.commandhistory

# Shell history location and prompt; see the comments in zshrc. Appended, not
# copied over, so the base image's Oh My Zsh setup stays.
COPY zshrc /tmp/zshrc
RUN cat /tmp/zshrc >> /home/vscode/.zshrc && rm /tmp/zshrc
