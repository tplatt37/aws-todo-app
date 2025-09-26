# Solution Architect Associate Demo

## EC2 & Instance Profile 

1. Launch an EC2 instance (t2.small, Amazon Linux 2023)
2. Use any Public Subnet, make sure it Assign Public IP is ENABLED
3. Create New Security Group (we'll need to open port 3000 later)
2. Create an IAM Profile:
    (New tab in IAM Roles, Create Role)
    Trusted Entity Type: AWS Service
    Use case: EC2
    Add Permission Policies:
        AmazonS3ReadOnlyAccess
        AmazonSSMManagedInstanceCore
    Role name: todo-app
    Return to EC2 instance, Refresh and choose "todo-app" as the "IAM Instance Profile"
3. Paste ec2/userdata.txt into the User Data section under Advanced Settings

(It will take 2-3 minutes to boot and to RUN the user data)

If issues, use the "Connect" button to get to a terminal:

```
sudo su - 
cd /var/log
cat cloud-init-output.log
```

4. Open http://(Public IP):3000

You should see the app, but it will be missing it's database.

(We'll add that next)

## DynamoDB

1. Create a table named: TodoItems-dev
2. Make "id" (string) the Partition key.  That's it.
3. Go to IAM Roles, find "todo-app" , add DynamoDBFull access policy

You can now Add, Edit, Delete todo items! 

## S3 Bucket for exports

1. Try the "Export to CSV button" - it will fail with 404 NoSuchBucket
2. Create a bucket named: todo-exports-$AWS_ACCOUNT_ID-dev
3. Try again, you'll get 403 (Access Denied) s3:PutObject 

How do we fix?   Go write a customer managed policy or inline policy to give read/write to this specific bucket

*** Make sure you give permissions to the BUCKET CONTENTS ***
arn:aws:s3:::todo-exports-123456789012-dev/*

# SNS

## Create SNS Topic

1. Create a topic named "test"
2. Add an Email subscription - make sure it works (You MUST "Confirm Subscription")

## Configure App to use the SNS Topic

3. Create a LAUNCH TEMPLATE so you can easily revise settings
4. Add 
SNS_TOPIC_ARN=arn:aws:sns:us-east-1:123456789012:test 
To the line that launches nodejs.  This sets another environment variable.
5. Launch instance from this template

We also need to TURN ON the code path via a Feature Flag (an SSM Parameter)

## Configure Systems Manager Parameter Store

6. Go to SSM Parameter Store
7. Create parameter
    Name: /todoapp/dev/sendNotifications
    Data type: text 
    Value: true

## Permissions

8. We need to make sure the EC2 Instance Profile Role has :
* AmazonSNSFullAccess
* AmazonSSMReadOnlyAccess


Go to the app and update an item to any status - you should get an email!

# SQS & Lambda

# Cleanup

1. Terminate EC2 instance
2. Delete Launch Template
3. Delete DynamoDB Table
4. Delete IAM todo-app role and any customer managed policy
5. Delete SSM Parameters
6. Delete SNS Topic
7. Delete SQS Queue
8. Empty and Delete both S3 buckets (Builds and Exports)
