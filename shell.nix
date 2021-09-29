let
  sources = import ./nix/sources.nix;
  pkgs = import sources.nixpkgs { };
in pkgs.mkShell {
  name = "benchmark";
  buildInputs = with pkgs; [
    nodejs

    # keep this line if you use bash
    bashInteractive
  ];
}
