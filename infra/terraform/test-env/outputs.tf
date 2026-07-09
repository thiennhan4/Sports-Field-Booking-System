output "alb_url" {
  description = "Public ALB URL for API smoke tests."
  value       = "http://${aws_lb.api.dns_name}"
}

output "ecr_repository_url" {
  description = "ECR repository URI for the backend API image."
  value       = aws_ecr_repository.api.repository_url
}

output "ecs_cluster_name" {
  description = "ECS cluster name."
  value       = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  description = "ECS service name."
  value       = aws_ecs_service.api.name
}

output "target_group_arn" {
  description = "ALB target group ARN for health checks."
  value       = aws_lb_target_group.api.arn
}

output "cloudwatch_log_group" {
  description = "CloudWatch log group for API container logs."
  value       = aws_cloudwatch_log_group.api.name
}

output "rds_endpoint" {
  description = "RDS endpoint. Do not expose publicly."
  value       = aws_db_instance.sqlserver.address
}

output "redis_endpoint" {
  description = "Redis endpoint. Do not expose publicly."
  value       = aws_elasticache_cluster.redis.cache_nodes[0].address
}
