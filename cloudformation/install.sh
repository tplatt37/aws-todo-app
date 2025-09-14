#!/bin/bash


# Deploy the stack (replace 'my-todo-app-stack' with your preferred stack name)
aws cloudformation create-stack \
  --stack-name my-todo-app-stack \
  --template-body file://infrastructure.yaml \
  --parameters ParameterKey=Environment,ParameterValue=dev \
  --capabilities CAPABILITY_NAMED_IAM \
  --region us-east-1
