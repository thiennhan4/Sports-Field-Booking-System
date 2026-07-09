resource "random_password" "jwt" {
  length  = 48
  special = false
}

resource "aws_secretsmanager_secret" "connection_string" {
  name                    = "${local.name}/connection-string"
  recovery_window_in_days = 0

  tags = {
    Name = "${local.name}-connection-string"
  }
}

resource "aws_secretsmanager_secret_version" "connection_string" {
  secret_id = aws_secretsmanager_secret.connection_string.id
  secret_string = "Server=${aws_db_instance.sqlserver.address},1433;Database=${var.rds_database_name};User Id=${var.rds_username};Password=${random_password.rds.result};TrustServerCertificate=True;"
}

resource "aws_secretsmanager_secret" "jwt_secret" {
  name                    = "${local.name}/jwt-secret"
  recovery_window_in_days = 0

  tags = {
    Name = "${local.name}-jwt-secret"
  }
}

resource "aws_secretsmanager_secret_version" "jwt_secret" {
  secret_id     = aws_secretsmanager_secret.jwt_secret.id
  secret_string = random_password.jwt.result
}
