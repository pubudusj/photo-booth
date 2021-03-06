AWS_PROFILE=$(shell grep AWS_PROFILE .env | cut -d '=' -f2)
REMOVE_BG_API_KEY=$(shell grep REMOVE_BG_API_KEY .env | cut -d '=' -f2)
TOTAL_BACKGROUNDS=$(shell grep TOTAL_BACKGROUNDS .env | cut -d '=' -f2)
SES_FROM_ADDRESS=$(shell grep SES_FROM_ADDRESS .env | cut -d '=' -f2)
STAGE=$(shell grep STAGE .env | cut -d '=' -f2)

install:
	yarn install
	mkdir -p jimp-external/jimp
	cp -R ./node_modules/jimp/* jimp-external/jimp
	cd jimp-external/jimp && yarn install --cwd .

deploy: install setup_backend setup_frontend

setup_backend:
	@echo 'Deploying Serverless PhtoBooth stack'
	AWS_PROFILE=${AWS_PROFILE} SLS_DEBUG=* REMOVE_BG_API_KEY=${REMOVE_BG_API_KEY} TOTAL_BACKGROUNDS=${TOTAL_BACKGROUNDS} SES_FROM_ADDRESS=${SES_FROM_ADDRESS} sls deploy --stage=${STAGE}
	aws s3 cp ./backgrounds/ s3://$(shell jq -r .S3BucketName ./output.json)/backgrounds/ --recursive --profile=${AWS_PROFILE}

setup_frontend:
	cd ./frontend/ && yarn install
	cp ./frontend/.env.example ./frontend/.env
	echo $(shell jq .ServiceEndpoint ./output.json) >> ./frontend/.env
	cd ./frontend/ && yarn build
	cd ./frontend/dist && zip -r frontend.zip .

delete:
	AWS_PROFILE=${AWS_PROFILE} SLS_DEBUG=* REMOVE_BG_API_KEY=${REMOVE_BG_API_KEY} TOTAL_BACKGROUNDS=${TOTAL_BACKGROUNDS} SES_FROM_ADDRESS=${SES_FROM_ADDRESS} sls delete --stage=${STAGE}
