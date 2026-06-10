# --- CI roles assumed by GitHub Actions via OIDC ---

locals {
  state_arn = aws_s3_bucket.tfstate.arn
}

# State backend access: read state, write the native S3 lock object. Both roles
# need this (plan also takes a lock). No infra mutation lives here.
data "aws_iam_policy_document" "state_access" {
  statement {
    sid       = "ListStateBucket"
    effect    = "Allow"
    actions   = ["s3:ListBucket", "s3:GetBucketVersioning"]
    resources = [local.state_arn]
  }
  statement {
    sid       = "RWStateObjects"
    effect    = "Allow"
    actions   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
    resources = ["${local.state_arn}/*"]
  }
}

# ===================== PLAN role (read-only) =====================
resource "aws_iam_role" "ci_plan" {
  name                 = "portfolio-ci-plan"
  assume_role_policy   = data.aws_iam_policy_document.assume_plan.json
  max_session_duration = 3600
}

# Read everything (so `terraform plan` can refresh), change nothing.
resource "aws_iam_role_policy_attachment" "plan_readonly" {
  role       = aws_iam_role.ci_plan.name
  policy_arn = "arn:aws:iam::aws:policy/ReadOnlyAccess"
}

resource "aws_iam_role_policy" "plan_state" {
  name   = "state-access"
  role   = aws_iam_role.ci_plan.id
  policy = data.aws_iam_policy_document.state_access.json
}

# ===================== APPLY role (scoped write) =====================
resource "aws_iam_role" "ci_apply" {
  name                 = "portfolio-ci-apply"
  assume_role_policy   = data.aws_iam_policy_document.assume_apply.json
  max_session_duration = 3600
}

resource "aws_iam_role_policy" "apply_state" {
  name   = "state-access"
  role   = aws_iam_role.ci_apply.id
  policy = data.aws_iam_policy_document.state_access.json
}

# Least-privilege deploy policy: only the services + ARNs the main stack manages.
data "aws_iam_policy_document" "apply_deploy" {
  # S3 site bucket (create/configure/upload) — scoped to the one bucket.
  statement {
    sid    = "SiteBucket"
    effect = "Allow"
    actions = [
      "s3:CreateBucket", "s3:DeleteBucket", "s3:ListBucket",
      "s3:GetBucket*", "s3:PutBucket*", "s3:DeleteBucketPolicy",
      "s3:PutObject", "s3:GetObject", "s3:DeleteObject",
      "s3:PutEncryptionConfiguration", "s3:GetEncryptionConfiguration",
      "s3:PutBucketPublicAccessBlock", "s3:GetBucketPublicAccessBlock",
      "s3:PutBucketOwnershipControls", "s3:GetBucketOwnershipControls"
    ]
    resources = [
      "arn:aws:s3:::aravindakrishnan-portfolio-site",
      "arn:aws:s3:::aravindakrishnan-portfolio-site/*"
    ]
  }

  # CloudFront + OAC: no resource-level ARNs for create, so service-scoped.
  statement {
    sid    = "CloudFront"
    effect = "Allow"
    actions = [
      "cloudfront:CreateDistribution", "cloudfront:UpdateDistribution",
      "cloudfront:DeleteDistribution", "cloudfront:GetDistribution",
      "cloudfront:GetDistributionConfig", "cloudfront:ListDistributions",
      "cloudfront:TagResource", "cloudfront:ListTagsForResource",
      "cloudfront:CreateOriginAccessControl", "cloudfront:UpdateOriginAccessControl",
      "cloudfront:DeleteOriginAccessControl", "cloudfront:GetOriginAccessControl",
      "cloudfront:CreateInvalidation"
    ]
    resources = ["*"]
  }

  # ACM cert for the custom domain (cert ARN unknown before create).
  statement {
    sid    = "ACM"
    effect = "Allow"
    actions = [
      "acm:RequestCertificate", "acm:DeleteCertificate", "acm:DescribeCertificate",
      "acm:ListCertificates", "acm:ListTagsForCertificate", "acm:AddTagsToCertificate"
    ]
    resources = ["*"]
  }

  # Lambda visitor counter — scoped to the one function.
  statement {
    sid    = "Lambda"
    effect = "Allow"
    actions = [
      "lambda:CreateFunction", "lambda:DeleteFunction", "lambda:GetFunction",
      "lambda:UpdateFunctionCode", "lambda:UpdateFunctionConfiguration",
      "lambda:GetFunctionConfiguration", "lambda:ListVersionsByFunction",
      "lambda:TagResource", "lambda:ListTags",
      "lambda:CreateFunctionUrlConfig", "lambda:UpdateFunctionUrlConfig",
      "lambda:DeleteFunctionUrlConfig", "lambda:GetFunctionUrlConfig",
      "lambda:AddPermission", "lambda:RemovePermission", "lambda:GetPolicy"
    ]
    resources = ["arn:aws:lambda:*:${data.aws_caller_identity.current.account_id}:function:PortfolioVisitorCounterFunction"]
  }

  # DynamoDB visitor counter table — scoped to the one table.
  statement {
    sid    = "DynamoDB"
    effect = "Allow"
    actions = [
      "dynamodb:CreateTable", "dynamodb:DeleteTable", "dynamodb:DescribeTable",
      "dynamodb:DescribeContinuousBackups", "dynamodb:DescribeTimeToLive",
      "dynamodb:UpdateTable", "dynamodb:TagResource", "dynamodb:ListTagsOfResource"
    ]
    resources = ["arn:aws:dynamodb:*:${data.aws_caller_identity.current.account_id}:table/PortfolioVisitorCounter"]
  }

  # IAM for the Lambda execution role only — scoped by name.
  statement {
    sid    = "LambdaExecRole"
    effect = "Allow"
    actions = [
      "iam:CreateRole", "iam:DeleteRole", "iam:GetRole", "iam:PassRole",
      "iam:CreatePolicy", "iam:DeletePolicy", "iam:GetPolicy", "iam:GetPolicyVersion",
      "iam:ListPolicyVersions", "iam:CreatePolicyVersion", "iam:DeletePolicyVersion",
      "iam:AttachRolePolicy", "iam:DetachRolePolicy", "iam:ListAttachedRolePolicies",
      "iam:ListRolePolicies", "iam:TagRole", "iam:TagPolicy", "iam:ListInstanceProfilesForRole"
    ]
    resources = [
      "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/portfolio-lambda-execution-role",
      "arn:aws:iam::${data.aws_caller_identity.current.account_id}:policy/portfolio-lambda-permissions"
    ]
  }

  # CloudWatch Logs group for the Lambda.
  statement {
    sid    = "Logs"
    effect = "Allow"
    actions = [
      "logs:CreateLogGroup", "logs:DeleteLogGroup", "logs:DescribeLogGroups",
      "logs:PutRetentionPolicy", "logs:TagResource", "logs:ListTagsForResource"
    ]
    resources = ["arn:aws:logs:*:${data.aws_caller_identity.current.account_id}:log-group:/aws/lambda/PortfolioVisitorCounterFunction*"]
  }
}

resource "aws_iam_role_policy" "apply_deploy" {
  name   = "deploy"
  role   = aws_iam_role.ci_apply.id
  policy = data.aws_iam_policy_document.apply_deploy.json
}
