locals {
  name = var.project_name

  common_tags = {
    Project     = "SportBooking"
    Environment = var.environment
    ManagedBy   = "Terraform"
    Purpose     = "TemporaryCloudTest"
  }
}
