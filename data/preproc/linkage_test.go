package main

import (
	"fmt"
	"os"
	"testing"

	fd "github.com/digisan/gotk/filedir"
	lk "github.com/digisan/logkit"
)

func TestLinkage(t *testing.T) {

	files, _, err := fd.WalkFileDir("./out", false)
	lk.FailOnErr("%v", err)

	linkCol := LinkEntities(files...)
	// for _, link := range linkCol {
	// 	fmt.Println(link)
	// }

	fmt.Println("------------------------")

	js, err := Link2JSON(linkCol, "")
	lk.FailOnErr("%v", err)

	lk.FailOnErr("%v", os.WriteFile("class-link.json", []byte(js), os.ModePerm))
}
