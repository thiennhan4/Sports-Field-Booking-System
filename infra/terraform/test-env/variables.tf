variable "project_name" {
  description = "Prefix for all test resources. Keep this as sportbooking-test for easy cleanup."
  type        = string
  default     = "sportbooking-test"
}

variable "environment" {
  description = "Environment name."
  type        = string
  default     = "test"
}

variable "aws_region" {
  description = "AWS region for the temporary test deployment."
  type        = string
  default     = "ap-southeast-1"
}

variable "vpc_cidr" {
  description = "VPC CIDR block."
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Two availability zones for public/private subnets."
  type        = list(string)
  default     = ["ap-southeast-1a", "ap-southeast-1b"]
}

variable "backend_container_port" {
  description = "Port exposed by SportBooking.API."
  type        = number
  default     = 8080
}

variable "ecs_cpu" {
  description = "Fargate CPU units. 512 = 0.5 vCPU."
  type        = number
  default     = 512
}

variable "ecs_memory" {
  description = "Fargate memory in MiB."
  type        = number
  default     = 1024
}

variable "ecs_desired_count" {
  description = "Desired ECS task count. Keep 0 before the Docker image is pushed, then set to 1 for testing."
  type        = number
  default     = 0
}

variable "rds_instance_class" {
  description = "RDS SQL Server instance class for short test runs."
  type        = string
  default     = "db.t3.small"
}

variable "rds_allocated_storage" {
  description = "RDS allocated storage in GiB."
  type        = number
  default     = 20
}

variable "rds_database_name" {
  description = "Database name used by EF Core in the connection string."
  type        = string
  default     = "SportFieldBookingDb"
}

variable "rds_username" {
  description = "RDS master username."
  type        = string
  default     = "sportbookingadmin"
}

variable "redis_node_type" {
  description = "ElastiCache Redis node type."
  type        = string
  default     = "cache.t3.micro"
}

variable "frontend_url" {
  description = "Allowed frontend URL for CORS during API-only test."
  type        = string
  default     = "http://localhost:3000"
}
