# 1. Trigger a rebuild whenever requirements.txt changes
resource "terraform_data" "lambda_layer_build" {
  triggers_replace = filebase64sha256("${path.module}/../apps/worker/requirements.txt")

  provisioner "local-exec" {
    # Clean the old build, create the target folder, and install deps
    command = <<EOT
      rm -rf ${path.module}/dist/layer
      mkdir -p ${path.module}/dist/layer/python
      pip install \
        --platform manylinux2014_x86_64 \
        --target ${path.module}/dist/layer/python \
        --python-version 3.12 \
        --only-binary=:all: \
        -r ${path.module}/../apps/worker/requirements.txt
    EOT
  }
}

# 2. Zip the resulting 'python' folder
data "archive_file" "lambda_layer_zip" {
  type        = "zip"
  source_dir  = "${path.module}/dist/layer"
  output_path = "${path.module}/dist/layer.zip"
  
  # Crucial: Wait for the pip install to finish
  depends_on = [terraform_data.lambda_layer_build]
}

# 3. Create an S3 Bucket for Lambda Artifacts
resource "aws_s3_bucket" "lambda_artifacts" {
  bucket_prefix = "avgdown-lambda-artifacts-"
}

# 4. Upload the zip to S3 (Required for packages > 50MB)
resource "aws_s3_object" "lambda_layer_zip" {
  bucket      = aws_s3_bucket.lambda_artifacts.id
  key         = "layers/worker_deps_${data.archive_file.lambda_layer_zip.output_md5}.zip"
  source      = data.archive_file.lambda_layer_zip.output_path
  source_hash = data.archive_file.lambda_layer_zip.output_md5
}

# 5. Create the Layer resource from S3
resource "aws_lambda_layer_version" "python_dependencies" {
  s3_bucket           = aws_s3_bucket.lambda_artifacts.id
  s3_key              = aws_s3_object.lambda_layer_zip.key
  layer_name          = "avgdown_worker_deps"
  compatible_runtimes = ["python3.12"]
  source_code_hash    = data.archive_file.lambda_layer_zip.output_base64sha256
}
