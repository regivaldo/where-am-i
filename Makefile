ZIP_NAME = where-am-i.zip

.PHONY: zip clean

zip: clean
	zip -r $(ZIP_NAME) manifest.json icons/ src/ -x "*.DS_Store"

clean:
	rm -f $(ZIP_NAME)
