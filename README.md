# AWS Todo App

A simple, clean Multi-Page Application (MPA) for managing TODO items using Next.js, TypeScript, AWS DynamoDB, and S3.

This simple app is used for teaching AWS Solution Architect students about the basics of running an application on AWS.

** WARNING ** 

This is not a production quality application.   It is an example for teaching AWS Solution Architect students.  Therefore it has specifically been generated to be easy to understand and does not have robust considerations for security or privacy, etc.   You should not use this as the base for a production application.  Seriously, there's not even end user authentication.  If you deploy this to the cloud I recommend restricting access to your IP only via Security Group rule.

This application was generated using AI: Cline with Opus 4.1 and Sonnet 4.

## Features

- ✅ **CRUD Operations**: Create, Read, Update, and Delete todo items
- 📊 **Sortable Table**: Sort todos by description, due date, priority, or status
- 🎯 **Priority Levels**: High, Medium, Low
- 📈 **Status Tracking**: Not Started, In Progress, Done, Canceled
- 📁 **CSV Export**: Export todos to CSV with S3 storage and pre-signed URLs (10-minute expiration)
- 🔍 **Detailed Error Messages**: Comprehensive error handling with AWS service-specific messages
- 🎨 **Clean UI**: Responsive design with Tailwind CSS

## Prerequisites

- Node.js 18+ and npm
- AWS Account with appropriate permissions
- AWS CLI configured (optional, for CloudFormation deployment)

## Setup Instructions

### 1. Deploy AWS Infrastructure

Deploy the CloudFormation stack to create the required DynamoDB table and S3 bucket:

```bash
# Navigate to the cloudformation directory
cd cloudformation

# Deploy the stack (replace 'my-todo-app-stack' with your preferred stack name)
aws cloudformation create-stack \
  --stack-name my-todo-app-stack \
  --template-body file://infrastructure.yaml \
  --parameters ParameterKey=Environment,ParameterValue=dev \
  --capabilities CAPABILITY_NAMED_IAM \
  --region us-east-1

# Wait for stack creation to complete
aws cloudformation wait stack-create-complete \
  --stack-name my-todo-app-stack \
  --region us-east-1

# Get the stack outputs (save these values)
aws cloudformation describe-stacks \
  --stack-name my-todo-app-stack \
  --query 'Stacks[0].Outputs' \
  --region us-east-1
```

### 2. Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` and add your AWS credentials and resource names from the CloudFormation outputs:
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<AccessKeyId from CloudFormation outputs>
AWS_SECRET_ACCESS_KEY=<SecretAccessKey from CloudFormation outputs>
DYNAMODB_TABLE_NAME=<DynamoDBTableName from CloudFormation outputs>
S3_BUCKET_NAME=<S3BucketName from CloudFormation outputs>
```

**⚠️ Security Note**: Never commit `.env.local` to version control. The `.gitignore` file is already configured to exclude it.

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Application

#### Development Mode
```bash
npm run dev
```
The app will be available at [http://localhost:3000](http://localhost:3000)

#### Production Build
```bash
npm run build
npm run start
```

## Application Structure

```
aws-todo-app/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes for CRUD and export
│   ├── add/               # Add new todo page
│   ├── edit/[id]/         # Edit todo page
│   └── page.tsx           # Main todo list page
├── components/            # Reusable React components
├── lib/                   # AWS SDK configurations and types
├── utils/                 # Utility functions
└── cloudformation/        # AWS infrastructure templates
```

## Usage

### Main Features

1. **View Todos**: The home page displays all todos in a sortable table
2. **Add Todo**: Click "Add Todo" in the navigation to create a new item
3. **Edit Todo**: Click "Edit" on any todo row to modify it
4. **Delete Todo**: Click "Delete" on any todo row (with confirmation)
5. **Sort**: Click column headers to sort by that field
6. **Export**: Click "Export to CSV" to download all todos

### Todo Fields

- **Description**: Text description of the task
- **Due Date**: When the task should be completed
- **Priority**: High, Medium, or Low
- **Status**: Not Started, In Progress, Done, or Canceled

## Error Handling

The application provides detailed error messages for common AWS issues:

- **DynamoDB Connection Errors**: Table not found, permissions, throttling
- **S3 Export Errors**: Bucket not found, permissions, network issues
- **Authentication Errors**: Invalid or missing AWS credentials
- **Validation Errors**: Invalid input data

Error details include:
- Specific error messages
- Helpful hints for resolution
- AWS service information (table names, regions, etc.)
- Stack traces in development mode

## CSV Export Feature

The export feature:
1. Generates a CSV file with all todo items
2. Uploads it to the configured S3 bucket
3. Creates a pre-signed URL valid for 10 minutes
4. Automatically opens the download link in a new tab

CSV includes: ID, Description, Due Date, Priority, Status, Created At, Updated At

## Troubleshooting

### Common Issues

1. **"DynamoDB table not found"**
   - Verify the table name in `.env.local` matches CloudFormation output
   - Ensure the table exists in the correct region (us-east-1)

2. **"Authentication failed"**
   - Check AWS credentials in `.env.local`
   - Verify the IAM user has necessary permissions

3. **"S3 bucket not found"**
   - Verify the bucket name in `.env.local`
   - Ensure the bucket exists and has proper permissions

4. **"Unable to connect to AWS"**
   - Check internet connection
   - Verify AWS region is correct (us-east-1)
   - Check if AWS services are accessible from your network

### Development Tips

- Use the browser's Developer Console to see detailed error logs
- Check the Next.js terminal output for server-side errors
- Verify environment variables are loaded correctly
- Test with AWS CLI to ensure credentials work

## Security Considerations

- Store AWS credentials securely (use IAM roles in production)
- Never commit `.env.local` or AWS credentials to version control
- Use least-privilege IAM policies
- Consider implementing authentication for production use or restricting access via Security Groups.
- Enable AWS CloudTrail for audit logging

## Production Deployment

For production deployment:

1. Use environment variables from your hosting provider (Vercel, AWS Amplify, etc.)
2. Consider using IAM roles instead of access keys
3. Enable HTTPS
4. Implement authentication/authorization
5. Set up monitoring and alerting
6. Configure backup strategies for DynamoDB

## Support

For issues or questions, please check the error messages displayed in the application, which provide detailed information about any problems encountered.
