{ pkgs }: {
  channel = "stable-24.05";
  packages = [
    pkgs.nodejs_20
    pkgs.bun
  ];
  idx.extensions = [
    "biomejs.biome"
    "dsznajder.es7-react-js-snippets"
    "formulahendry.auto-close-tag"
    "Prisma.prisma"
    "steoates.autoimport"
  ];
  idx.previews = {
    previews = {
      web = {
        command = [
          "npm"
          "run"
          "dev"
          "--"
          "--port"
          "$PORT"
          "--hostname"
          "0.0.0.0"
        ];
        manager = "web";
      };
    };
  };
}
