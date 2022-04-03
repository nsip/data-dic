package main

import (
	"fmt"
	"os"
	"strings"

	. "github.com/digisan/go-generics/v2"
	lk "github.com/digisan/logkit"
	"github.com/tidwall/gjson"
)

func SupClsCol(js string) map[string][]string {
	ret := make(map[string][]string)
	entity := gjson.Get(js, "Entity").String()
	supers := gjson.Get(js, "Superclass").Array()
	for _, super := range supers {
		ret[entity] = append(ret[entity], super.String())
	}
	return ret
}

func SwapES(m map[string][]string) map[string][]string {
	ret := make(map[string][]string)
	for entity, supers := range m {
		for _, super := range supers {
			ret[super] = append(ret[super], entity)
		}
	}
	return ret
}

func EntitiesDescArr(fpaths ...string) []map[string][]string {
	mEDs := make([]map[string][]string, 0, len(fpaths))
	for _, path := range fpaths {
		data, err := os.ReadFile(path)
		lk.FailOnErr("%v", err)
		js := string(data)
		mES := SupClsCol(js)
		mEDs = append(mEDs, SwapES(mES))
	}
	return mEDs
}

func EntityDesc(fpaths ...string) map[string][]string {

	mEDs := EntitiesDescArr(fpaths...)
	keys := []string{}
	for _, mED := range mEDs {
		for k := range mED {
			keys = append(keys, k)
		}
	}
	keys = Settify(keys...)

	mEDsKey := make(map[string][]string)
	for _, key := range keys {
		for _, mED := range mEDs {
			for k := range mED {
				if k == key {
					mEDsKey = MapMergeOnValSlc(mEDsKey, mED)
				}
			}
		}
	}

	/// for testing deeply
	mEDsKey["Campus"] = []string{"Sydenham Campus", "Hillside Campus", "Taylors Camplus"}
	mEDsKey["Sydenham Campus"] = []string{"Sydenham-Hillside Campus 1"}
	mEDsKey["Hillside Campus"] = []string{"Sydenham-Hillside Campus 2"}
	///

	return mEDsKey
}

type List []string

func (ls List) String() string {
	sb := strings.Builder{}
	for i, ele := range ls {
		sb.WriteString(ele)
		if i < len(ls)-1 {
			sb.WriteString("-->")
		}
	}
	return sb.String()
}

func LinkEntity(mED map[string][]string, keyEntity string, ancestry List, linkCol *List) {
	lookfor := keyEntity
	for entity, descList := range mED {
		if entity == lookfor {
			for _, desc := range descList {
				link := fmt.Sprintf("%s-->%s-->%s", ancestry, entity, desc)
				link = strings.TrimLeft(link, "-->")
				// fmt.Println(link)
				*linkCol = append(*linkCol, link)
				lookfor = desc
				delete(mED, entity)
				ancestry = append(ancestry, keyEntity)
				LinkEntity(mED, lookfor, ancestry, linkCol)
				ancestry = ancestry[:len(ancestry)-1]
			}
		}
	}
}

func RmPartialLink(linkCol []string) []string {
AGAIN:
	for _, linkCheck := range linkCol {
		for _, linkCompare := range linkCol {
			if linkCheck != linkCompare {
				if strings.HasPrefix(linkCompare, linkCheck) ||
					strings.HasSuffix(linkCompare, linkCheck) ||
					strings.Contains(linkCompare, "-->"+linkCheck+"-->") {
					DelOneEle(&linkCol, linkCheck)
					goto AGAIN
				}
			}
		}
	}
	return linkCol
}

func LinkEntities(fpaths ...string) (out []string) {
	mED := EntityDesc(fpaths...)
	for k := range mED {
		linkCol := &List{}
		LinkEntity(MapCopy(mED), k, List{}, linkCol)
		out = append(out, RmPartialLink(*linkCol)...)
	}
	return RmPartialLink(out)
}
