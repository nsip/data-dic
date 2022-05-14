package main

import (
	"io/fs"
	"os"
	"path/filepath"
	"strings"

	fd "github.com/digisan/gotk/filedir"
	lk "github.com/digisan/logkit"
)

func main() {

	// lk.Log2F(true, "./preproc.log")

	// clear current directory json files
	filepath.Walk("./", func(path string, info fs.FileInfo, err error) error {
		var e error
		if strings.HasSuffix(path, ".json") {
			e = os.Remove(path)
		}
		return e
	})

	// make sure each file's name is its entity value
	FixFilename("../")

	// create './out' in this function
	Preproc("../")

	/////////////////////////////////////////////////////////////////////

	files, _, err := fd.WalkFileDir("./out", false)
	lk.FailOnErr("%v", err)

	linkCol := LinkEntities(files...)

	js, err := Link2JSON(linkCol, "")
	lk.FailOnErr("%v", err)

	lk.FailOnErr("%v", os.WriteFile("./out/class-link.json", []byte(js), os.ModePerm))

}
