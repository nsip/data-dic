package main

import nt "github.com/digisan/gotk/net-tool"

func LiteralLocIP2PubIP(oldport, newport int, filepaths ...string) error {
	for _, fpath := range filepaths {
		if err := nt.ChangeLocalUrlPort(fpath, oldport, newport); err != nil {
			return err
		}
		if err := nt.LocIP2PubIP(fpath); err != nil {
			return err
		}
	}
	return nil
}

func main() {
	LiteralLocIP2PubIP(3000, 80, "../www/func.js")
}
