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

# Cleanup

1. Terminate EC2 instance
2. Delete DynamoDB Table
3. Delete IAM todo-app role and any customer managed policy
4. Delete SSM Parameters
5. Delete SNS Topic
6. Delete SQS Queue
7. Empty and Delete both S3 buckets (Builds and Exports)
