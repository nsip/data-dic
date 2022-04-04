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

	filepath.Walk("./", func(path string, info fs.FileInfo, err error) error {
		var e error
		if strings.HasSuffix(path, ".json") {
			e = os.Remove(path)
		}
		return e
	})
	Preproc() // create './out' in this function

	/////////////////////////////////////////////////////////////////////

	files, _, err := fd.WalkFileDir("./out", false)
	lk.FailOnErr("%v", err)

	linkCol := LinkEntities(files...)

	js, err := Link2JSON(linkCol, "")
	lk.FailOnErr("%v", err)

	lk.FailOnErr("%v", os.WriteFile("./out/class-link.json", []byte(js), os.ModePerm))

}
