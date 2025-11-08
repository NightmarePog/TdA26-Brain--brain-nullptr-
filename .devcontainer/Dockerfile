# Base image
FROM archlinux:latest

# Aktualizace systému a instalace základních nástrojů
RUN pacman -Syu --noconfirm \
    bash sudo curl git base-devel nodejs npm fish \
    && pacman -Scc --noconfirm

# Vytvoření non-root uživatele
RUN useradd -m dev && echo "dev ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# Přepnutí na root pro opravu práv a vytvoření potřebných adresářů
USER root
RUN mkdir -p /home/dev/workspace /home/dev/.config/fish \
    && chown -R dev:dev /home/dev

# Přepnutí zpět na dev
USER dev
WORKDIR /home/dev/workspace

# Nastavení fish jako default shell pro uživatele dev
RUN echo 'exec fish' >> /home/dev/.bashrc
