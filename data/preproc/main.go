package main

import (
	"io/fs"
	"os"
	"path/filepath"
	"strings"
)

func main() {
	filepath.Walk("./", func(path string, info fs.FileInfo, err error) error {
		var e error
		if strings.HasSuffix(path, ".json") {
			e = os.Remove(path)
		}
		return e
	})
	Preproc()
}
