param(
    [string]$Region = "ap-southeast-1",
    [string]$Profile = "sportbooking"
)

$ErrorActionPreference = "Stop"

Write-Host "Checking remaining SportBooking test resources in $Region..."

Write-Host "`nECS clusters:"
aws ecs list-clusters --region $Region --profile $Profile --query "clusterArns[?contains(@, 'sportbooking-test')]"

Write-Host "`nRDS instances:"
aws rds describe-db-instances --region $Region --profile $Profile --query "DBInstances[?contains(DBInstanceIdentifier, 'sportbooking-test')].[DBInstanceIdentifier,DBInstanceStatus]"

Write-Host "`nRDS snapshots:"
aws rds describe-db-snapshots --region $Region --profile $Profile --query "DBSnapshots[?contains(DBSnapshotIdentifier, 'sportbooking-test')].[DBSnapshotIdentifier,Status]"

Write-Host "`nElastiCache clusters:"
aws elasticache describe-cache-clusters --region $Region --profile $Profile --query "CacheClusters[?contains(CacheClusterId, 'sportbooking-test')].[CacheClusterId,CacheClusterStatus]"

Write-Host "`nLoad balancers:"
aws elbv2 describe-load-balancers --region $Region --profile $Profile --query "LoadBalancers[?contains(LoadBalancerName, 'sportbooking-test')].[LoadBalancerName,State.Code]"

Write-Host "`nECR repositories:"
aws ecr describe-repositories --region $Region --profile $Profile --query "repositories[?contains(repositoryName, 'sportbooking-test')].repositoryName"

Write-Host "`nCloudWatch log groups:"
aws logs describe-log-groups --region $Region --profile $Profile --log-group-name-prefix "/ecs/sportbooking-test" --query "logGroups[].logGroupName"

Write-Host "`nSecrets:"
aws secretsmanager list-secrets --region $Region --profile $Profile --filters Key=name,Values=sportbooking-test --query "SecretList[].Name"

Write-Host "`nElastic IPs tagged with sportbooking-test:"
aws ec2 describe-addresses --region $Region --profile $Profile --query "Addresses[?Tags[?Value=='sportbooking-test']]"
