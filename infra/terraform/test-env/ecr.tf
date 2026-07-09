resource "aws_ecr_repository" "api" {
  name         = "${local.name}-api"
  force_delete = true

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "${local.name}-api"
  }
}
