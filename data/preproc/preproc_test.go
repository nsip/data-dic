package main

import (
	"io/fs"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestPreproc(t *testing.T) {

	filepath.Walk("./", func(path string, info fs.FileInfo, err error) error {
		var e error
		if strings.HasSuffix(path, ".json") {
			e = os.Remove(path)
		}
		return e
	})

	Preproc()
}
