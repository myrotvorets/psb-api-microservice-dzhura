IMAGE := psb-api-dzhura
TAG := latest
REGISTRY := dcr.int.myrotvorets.center

context.tar: Makefile
context.tar: src package.json package-lock.json tsconfig.json tsconfig-base.json Dockerfile
	tar chf "$@" $^

docker: context.tar
	cat "$<" | docker build --pull -t $(REGISTRY)/$(IMAGE):$(TAG) -f Dockerfile -

push: docker
	docker push $(REGISTRY)/$(IMAGE):$(TAG)

clean:
	rm -f context.tar

.PHONY: docker push clean
