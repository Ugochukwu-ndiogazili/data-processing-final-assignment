# StreamFlix Backup and Recovery Protocol

## Overview

This document outlines the backup and recovery procedures for the StreamFlix database system to ensure data integrity and business continuity.

## Backup Strategy

### 1. Database Backup Types

#### Full Backup
- **Frequency**: Daily at 2:00 AM UTC
- **Retention**: 30 days
- **Location**: `/backups/full/`
- **Format**: PostgreSQL dump (pg_dump)

#### Incremental Backup
- **Frequency**: Every 6 hours
- **Retention**: 7 days
- **Location**: `/backups/incremental/`
- **Format**: WAL (Write-Ahead Log) files

#### Transaction Log Backup
- **Frequency**: Continuous (WAL archiving)
- **Retention**: 14 days
- **Location**: `/backups/wal/`

### 2. Backup Procedures

#### Automated Backup Script

```bash
#!/bin/bash
# backup.sh - Automated backup script

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="streamflix"
DB_USER="postgres"
RETENTION_DAYS=30

# Full backup
pg_dump -U $DB_USER -d $DB_NAME -F c -f "$BACKUP_DIR/full/streamflix_$DATE.dump"

# Cleanup old backups
find $BACKUP_DIR/full -name "*.dump" -mtime +$RETENTION_DAYS -delete
```

#### Docker Compose Backup

Add to `docker-compose.yml`:

```yaml
services:
  backup:
    image: postgres:16
    volumes:
      - ./backups:/backups
      - pgdata:/var/lib/postgresql/data
    environment:
      PGPASSWORD: ${DB_PASSWORD}
    command: >
      sh -c "
        pg_dump -h postgres -U postgres -d streamflix -F c -f /backups/streamflix_$(date +%Y%m%d_%H%M%S).dump &&
        find /backups -name '*.dump' -mtime +30 -delete
      "
    depends_on:
      - postgres
```

### 3. Backup Verification

#### Automated Verification
- **Frequency**: After each backup
- **Method**: Restore test on isolated environment
- **Checks**: Data integrity, referential constraints, index validity

#### Manual Verification
```bash
# Verify backup file
pg_restore --list backup_file.dump

# Test restore (dry run)
pg_restore --dry-run backup_file.dump
```

## Recovery Procedures

### 1. Point-in-Time Recovery (PITR)

#### Prerequisites
- Full backup available
- WAL files archived
- Recovery target time identified

#### Recovery Steps

1. **Stop the database service**
   ```bash
   docker compose stop postgres
   ```

2. **Restore base backup**
   ```bash
   pg_restore -U postgres -d streamflix -c backup_file.dump
   ```

3. **Configure recovery**
   ```sql
   -- Create recovery.conf (PostgreSQL 12+ uses postgresql.conf)
   recovery_target_time = '2024-11-28 14:30:00'
   restore_command = 'cp /backups/wal/%f %p'
   ```

4. **Start database**
   ```bash
   docker compose start postgres
   ```

### 2. Full Database Recovery

#### Scenario: Complete Database Loss

1. **Stop application**
   ```bash
   docker compose stop
   ```

2. **Remove corrupted data**
   ```bash
   docker volume rm dataprocessing_pgdata
   ```

3. **Restore from backup**
   ```bash
   docker compose up -d postgres
   # Wait for postgres to be ready
   pg_restore -U postgres -d streamflix -c latest_backup.dump
   ```

4. **Verify data integrity**
   ```sql
   SELECT COUNT(*) FROM "Account";
   SELECT COUNT(*) FROM "Profile";
   SELECT COUNT(*) FROM "Title";
   -- Verify referential integrity
   ```

5. **Restart application**
   ```bash
   docker compose up -d
   ```

### 3. Partial Recovery

#### Scenario: Single Table Corruption

1. **Identify corrupted table**
   ```sql
   SELECT * FROM "Account" LIMIT 1; -- Test query
   ```

2. **Backup current state** (if possible)
   ```bash
   pg_dump -t "Account" -U postgres streamflix > account_backup.sql
   ```

3. **Restore specific table**
   ```bash
   pg_restore -t "Account" -U postgres -d streamflix backup_file.dump
   ```

### 4. Disaster Recovery

#### RTO (Recovery Time Objective): 4 hours
#### RPO (Recovery Point Objective): 1 hour

#### Disaster Recovery Steps

1. **Assessment** (15 minutes)
   - Identify scope of data loss
   - Determine recovery point
   - Verify backup availability

2. **Preparation** (30 minutes)
   - Provision recovery environment
   - Prepare backup files
   - Notify stakeholders

3. **Recovery** (2 hours)
   - Restore database
   - Verify data integrity
   - Test application connectivity

4. **Validation** (1 hour)
   - Functional testing
   - Data validation
   - Performance testing

5. **Cutover** (15 minutes)
   - Switch to recovered system
   - Monitor for issues
   - Document recovery

## Backup Storage

### Local Storage
- **Location**: `/backups/` directory
- **Encryption**: GPG encryption for sensitive backups
- **Access**: Restricted to backup service account

### Remote Storage (Recommended)
- **Cloud Storage**: AWS S3, Google Cloud Storage, or Azure Blob
- **Replication**: 3 copies in different regions
- **Encryption**: At-rest encryption enabled

### Backup Rotation
- **Daily backups**: Keep for 30 days
- **Weekly backups**: Keep for 12 weeks
- **Monthly backups**: Keep for 12 months
- **Yearly backups**: Keep indefinitely

## Monitoring and Alerts

### Backup Monitoring
- **Success/Failure**: Email alerts on backup completion
- **Size Monitoring**: Alert if backup size deviates >20%
- **Duration Monitoring**: Alert if backup takes >1 hour

### Health Checks
```sql
-- Check last backup time
SELECT MAX(backup_time) FROM backup_log;

-- Check database size
SELECT pg_size_pretty(pg_database_size('streamflix'));

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Testing Recovery

### Quarterly Recovery Tests
1. **Test Environment**: Isolated test database
2. **Test Scenarios**:
   - Full database recovery
   - Point-in-time recovery
   - Single table recovery
3. **Documentation**: Record recovery time and issues

### Recovery Test Checklist
- [ ] Backup file accessible
- [ ] Restore completes successfully
- [ ] All tables restored
- [ ] Referential integrity maintained
- [ ] Application connects successfully
- [ ] Data validation passes
- [ ] Performance acceptable

## Maintenance

### Weekly Tasks
- Verify backup completion
- Check backup file sizes
- Review backup logs
- Test backup restoration

### Monthly Tasks
- Review backup retention policy
- Archive old backups
- Update recovery procedures
- Review disaster recovery plan

### Quarterly Tasks
- Full disaster recovery test
- Update documentation
- Review RTO/RPO objectives
- Security audit of backup storage

## Emergency Contacts

- **Database Administrator**: [Contact Info]
- **System Administrator**: [Contact Info]
- **Backup Service Provider**: [Contact Info]

## Appendix

### Backup Script Location
- `/scripts/backup.sh`
- `/scripts/restore.sh`
- `/scripts/verify_backup.sh`

### Configuration Files
- `postgresql.conf`: Database configuration
- `pg_hba.conf`: Access control
- `recovery.conf`: Recovery settings (PostgreSQL <12)

### Log Locations
- Backup logs: `/var/log/backups/`
- Database logs: Docker container logs
- Application logs: `/var/log/streamflix/`




