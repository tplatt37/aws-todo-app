# SNS Notification Setup Guide

This document explains how to configure and use the SNS notification feature for the AWS Todo App.

## Overview

When the `sendNotifications` feature flag is enabled, the application will automatically send JSON-formatted messages to an SNS topic whenever:
- A new todo item is created
- An existing todo item is updated

## Configuration Requirements

### 1. Environment Variables

Add the following environment variable to your `.env.local` file:

```bash
SNS_TOPIC_ARN=arn:aws:sns:us-east-1:123456789012:your-topic-name
```

Replace the ARN with your actual SNS topic ARN.

### 2. Feature Flag Configuration

Set the feature flag in AWS Parameter Store:

**Parameter Name:** `/todoapp/dev/sendNotifications`
**Value:** `true` (to enable) or `false` (to disable)

## How It Works

### Feature Flag Check
- The application checks the `sendNotifications` feature flag from AWS Parameter Store
- If `true`, SNS notifications are sent after successful todo operations
- If `false`, no notifications are sent

### Message Format
The SNS message contains the complete todo item as JSON:

```json
{
  "id": "uuid-here",
  "description": "Complete project documentation",
  "dueDate": "2024-01-15T00:00:00.000Z",
  "priority": "High",
  "status": "In Progress",
  "createdAt": "2024-01-10T10:30:00.000Z",
  "updatedAt": "2024-01-12T14:20:00.000Z"
}
```

### Message Subject
- For new todos: "Todo Updated: [description]"
- For completed todos: "Todo Completed: [description]"
- For other updates: "Todo Updated: [description]"

## Error Handling

### When Notifications Are Enabled
- If SNS fails, the entire todo operation fails
- Students will see detailed AWS error information including:
  - Error codes and messages
  - Request IDs for debugging
  - Complete error metadata
  - Stack traces (in development mode)

### When Notifications Are Disabled
- SNS errors are logged but don't affect todo operations
- The application continues to function normally

## Testing the Feature

1. **Enable notifications:**
   - Set `/todoapp/dev/sendNotifications` to `true` in Parameter Store
   - Ensure `SNS_TOPIC_ARN` is configured correctly

2. **Create or update a todo:**
   - Use the web interface or API endpoints
   - Check your SNS topic for the notification message

3. **Test error scenarios:**
   - Use an invalid SNS topic ARN to see error handling
   - Disable notifications to see the difference in behavior

## Educational Value

This implementation demonstrates:
- AWS SNS integration with Node.js
- Feature flag-driven functionality
- Error handling for AWS services
- JSON message formatting
- Conditional service integration

## Files Modified

- `lib/sns.ts` - New SNS utility module
- `lib/dynamodb.ts` - Added notification calls to create/update functions
- `package.json` - Added `@aws-sdk/client-sns` dependency

## AWS Permissions Required

Ensure your AWS credentials have the following SNS permissions:
- `sns:Publish` - To send messages to the topic
- `sns:GetTopicAttributes` - To validate topic access (optional)
