data "aws_caller_identity" "current" {}

# tfsec:ignore:aws-dynamodb-table-customer-key
# tfsec:ignore:aws-dynamodb-enable-recovery
resource "aws_dynamodb_table" "visitor_counter_table" {
  name         = "PortfolioVisitorCounter"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "ID"

  attribute {
    name = "ID"
    type = "S"
  }

  # No explicit server_side_encryption block: DynamoDB encrypts at rest by
  # default with an AWS-owned key (free, no KMS key to manage). Setting
  # enabled=true forces the aws/dynamodb managed key, which may not exist yet
  # in a fresh account/region and fails with a KMS NotFound error.
}

resource "aws_iam_role" "lambda_exec_role" {
  name = "portfolio-lambda-execution-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect    = "Allow",
        Principal = { Service = "lambda.amazonaws.com" },
        Action    = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_policy" "lambda_permissions_policy" {
  name        = "portfolio-lambda-permissions"
  description = "Allows Lambda to write to DynamoDB and CloudWatch Logs"
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect   = "Allow",
        Action   = ["dynamodb:PutItem", "dynamodb:GetItem", "dynamodb:UpdateItem"],
        Resource = aws_dynamodb_table.visitor_counter_table.arn
      },
      {
        Effect   = "Allow",
        Action   = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"],
        Resource = "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:log-group:/aws/lambda/*:*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_policy_attachment" {
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = aws_iam_policy.lambda_permissions_policy.arn
}

data "archive_file" "lambda_zip" {
  type        = "zip"
  source_file = "${path.module}/lambda/counter.py"
  output_path = "${path.module}/lambda/counter.zip"
}

# tfsec:ignore:aws-lambda-enable-tracing
resource "aws_lambda_function" "visitor_counter_lambda" {
  function_name    = "PortfolioVisitorCounterFunction"
  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  role             = aws_iam_role.lambda_exec_role.arn
  handler          = "counter.lambda_handler"
  runtime          = "python3.13"

  environment {
    variables = {
      ip_hash_secret = var.ip_hash_secret
      table_name     = aws_dynamodb_table.visitor_counter_table.name
    }
  }
}

# Free replacement for API Gateway: the browser POSTs straight to this URL.
resource "aws_lambda_function_url" "counter_url" {
  function_name      = aws_lambda_function.visitor_counter_lambda.function_name
  authorization_type = "NONE"

  cors {
    allow_origins = var.allowed_origins
    allow_methods = ["POST"]
    allow_headers = ["content-type"]
    max_age       = 86400
  }
}

resource "aws_lambda_permission" "function_url_permission" {
  statement_id           = "AllowPublicFunctionUrlInvoke"
  action                 = "lambda:InvokeFunctionUrl"
  function_name          = aws_lambda_function.visitor_counter_lambda.function_name
  principal              = "*"
  function_url_auth_type = "NONE"
}
