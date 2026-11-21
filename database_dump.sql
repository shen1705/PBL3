-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: carrental
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `carrental`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `carrental` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `carrental`;

--
-- Table structure for table `__efmigrationshistory`
--

DROP TABLE IF EXISTS `__efmigrationshistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `__efmigrationshistory` (
  `MigrationId` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ProductVersion` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`MigrationId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `__efmigrationshistory`
--

LOCK TABLES `__efmigrationshistory` WRITE;
/*!40000 ALTER TABLE `__efmigrationshistory` DISABLE KEYS */;
INSERT INTO `__efmigrationshistory` VALUES ('20261021084849_InitialCreate','10.0.13'),('20261112145728_AddHandoverDetails','10.0.13'),('20261112153759_AddBookingTermsAccepted','10.0.13'),('20261112161023_AddBookingPriceBreakdown','10.0.13'),('20261119155652_AddReviewReportingAndDisputeFields','10.0.13'),('20261121095825_AddNotificationsTable','10.0.13');
/*!40000 ALTER TABLE `__efmigrationshistory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `account_sanction`
--

DROP TABLE IF EXISTS `account_sanction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `account_sanction` (
  `sanction_id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `sanction_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `issued_by` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `issued_at` datetime(6) NOT NULL,
  `expires_at` datetime(6) DEFAULT NULL,
  `lifted_by` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `lifted_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`sanction_id`),
  KEY `IX_account_sanction_issued_by` (`issued_by`),
  KEY `IX_account_sanction_lifted_by` (`lifted_by`),
  KEY `IX_account_sanction_user_id` (`user_id`),
  CONSTRAINT `FK_account_sanction_users_issued_by` FOREIGN KEY (`issued_by`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT,
  CONSTRAINT `FK_account_sanction_users_lifted_by` FOREIGN KEY (`lifted_by`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT,
  CONSTRAINT `FK_account_sanction_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account_sanction`
--

LOCK TABLES `account_sanction` WRITE;
/*!40000 ALTER TABLE `account_sanction` DISABLE KEYS */;
INSERT INTO `account_sanction` VALUES (1,'97367a6b-0e5f-46c2-8b6e-e6bdd9dd68e6','Suspend7d','Hủy chuyến sát giờ và vi phạm quy định bàn giao xe','eea6da54-0e36-411e-a412-b3a3f85f94ac','2026-10-27 19:57:23.137063','2026-11-03 19:57:23.137063',NULL,NULL);
/*!40000 ALTER TABLE `account_sanction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `aspnetroleclaims`
--

DROP TABLE IF EXISTS `aspnetroleclaims`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aspnetroleclaims` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `claim_type` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `claim_value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  PRIMARY KEY (`id`),
  KEY `IX_AspNetRoleClaims_role_id` (`role_id`),
  CONSTRAINT `FK_AspNetRoleClaims_roles_role_id` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aspnetroleclaims`
--

LOCK TABLES `aspnetroleclaims` WRITE;
/*!40000 ALTER TABLE `aspnetroleclaims` DISABLE KEYS */;
/*!40000 ALTER TABLE `aspnetroleclaims` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `aspnetuserlogins`
--

DROP TABLE IF EXISTS `aspnetuserlogins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aspnetuserlogins` (
  `login_provider` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `provider_key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `provider_display_name` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `user_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`login_provider`,`provider_key`),
  KEY `IX_AspNetUserLogins_user_id` (`user_id`),
  CONSTRAINT `FK_AspNetUserLogins_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aspnetuserlogins`
--

LOCK TABLES `aspnetuserlogins` WRITE;
/*!40000 ALTER TABLE `aspnetuserlogins` DISABLE KEYS */;
/*!40000 ALTER TABLE `aspnetuserlogins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `aspnetusertokens`
--

DROP TABLE IF EXISTS `aspnetusertokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aspnetusertokens` (
  `user_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `login_provider` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  PRIMARY KEY (`user_id`,`login_provider`,`name`),
  CONSTRAINT `FK_AspNetUserTokens_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aspnetusertokens`
--

LOCK TABLES `aspnetusertokens` WRITE;
/*!40000 ALTER TABLE `aspnetusertokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `aspnetusertokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `booking_id` int NOT NULL AUTO_INCREMENT,
  `renter_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `listing_id` int NOT NULL,
  `vehicle_id` int NOT NULL,
  `source_hold_id` int NOT NULL,
  `start_date` datetime(6) NOT NULL,
  `end_date` datetime(6) NOT NULL,
  `rental_days` int NOT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `price_locked_total` decimal(12,2) NOT NULL,
  `deposit_amount` decimal(12,2) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `response_deadline` datetime(6) NOT NULL,
  `accepted_at` datetime(6) DEFAULT NULL,
  `responded_at` datetime(6) DEFAULT NULL,
  `reject_reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `completed_at` datetime(6) DEFAULT NULL,
  `cancelled_at` datetime(6) DEFAULT NULL,
  `cancelled_by` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `cancel_reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `terms_accepted_at` datetime(6) DEFAULT NULL,
  `delivery_fee` decimal(12,2) DEFAULT NULL,
  `insurance_fee` decimal(12,2) DEFAULT NULL,
  `price_per_day_at_booking` decimal(12,2) DEFAULT NULL,
  `rental_subtotal` decimal(12,2) DEFAULT NULL,
  PRIMARY KEY (`booking_id`),
  UNIQUE KEY `IX_bookings_source_hold_id` (`source_hold_id`),
  KEY `IX_bookings_cancelled_by` (`cancelled_by`),
  KEY `IX_bookings_listing_id` (`listing_id`),
  KEY `IX_bookings_renter_id` (`renter_id`),
  KEY `IX_bookings_status_response_deadline` (`status`,`response_deadline`),
  KEY `IX_bookings_vehicle_id_status_start_date_end_date` (`vehicle_id`,`status`,`start_date`,`end_date`),
  CONSTRAINT `FK_bookings_deposit_holds_source_hold_id` FOREIGN KEY (`source_hold_id`) REFERENCES `deposit_holds` (`hold_id`) ON DELETE RESTRICT,
  CONSTRAINT `FK_bookings_users_cancelled_by` FOREIGN KEY (`cancelled_by`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT,
  CONSTRAINT `FK_bookings_users_renter_id` FOREIGN KEY (`renter_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT,
  CONSTRAINT `FK_bookings_vehicle_listings_listing_id` FOREIGN KEY (`listing_id`) REFERENCES `vehicle_listings` (`listing_id`) ON DELETE RESTRICT,
  CONSTRAINT `FK_bookings_vehicles_vehicle_id` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`vehicle_id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (1,'367cb99f-62a9-49fe-bb53-e1cb4c14f54e',1,1,1,'2026-11-01 00:00:00.000000','2026-11-04 00:00:00.000000',4,'Completed',3100000.00,775000.00,'2026-10-28 10:00:00.000000','2026-10-29 10:00:00.000000','2026-10-28 14:00:00.000000','2026-10-28 14:00:00.000000',NULL,'2026-11-04 18:00:00.000000',NULL,NULL,NULL,'2026-10-28 10:00:00.000000',100000.00,200000.00,700000.00,2800000.00),(2,'03b257a9-4b0f-48de-9361-e2a20e9dd9a9',3,3,2,'2026-11-05 00:00:00.000000','2026-11-08 00:00:00.000000',4,'Completed',4600000.00,1150000.00,'2026-11-02 09:00:00.000000','2026-11-03 09:00:00.000000','2026-11-02 12:00:00.000000','2026-11-02 12:00:00.000000',NULL,'2026-11-08 17:30:00.000000',NULL,NULL,NULL,'2026-11-02 09:00:00.000000',0.00,200000.00,1100000.00,4400000.00),(3,'c789fb44-c4c0-4443-9d79-f8aec591c207',7,7,3,'2026-11-03 00:00:00.000000','2026-11-06 00:00:00.000000',4,'Completed',4000000.00,1000000.00,'2026-10-31 14:00:00.000000','2026-11-01 14:00:00.000000','2026-10-31 16:00:00.000000','2026-10-31 16:00:00.000000',NULL,'2026-11-06 16:00:00.000000',NULL,NULL,NULL,'2026-10-31 14:00:00.000000',0.00,200000.00,950000.00,3800000.00),(4,'367cb99f-62a9-49fe-bb53-e1cb4c14f54e',9,9,4,'2026-11-08 00:00:00.000000','2026-11-11 00:00:00.000000',4,'Completed',3300000.00,825000.00,'2026-11-05 08:30:00.000000','2026-11-06 08:30:00.000000','2026-11-05 11:00:00.000000','2026-11-05 11:00:00.000000',NULL,'2026-11-11 17:00:00.000000',NULL,NULL,NULL,'2026-11-05 08:30:00.000000',100000.00,200000.00,750000.00,3000000.00),(5,'03b257a9-4b0f-48de-9361-e2a20e9dd9a9',13,13,5,'2026-11-10 00:00:00.000000','2026-11-13 00:00:00.000000',4,'Completed',2800000.00,700000.00,'2026-11-07 10:00:00.000000','2026-11-08 10:00:00.000000','2026-11-07 13:00:00.000000','2026-11-07 13:00:00.000000',NULL,'2026-11-13 16:30:00.000000',NULL,NULL,NULL,'2026-11-07 10:00:00.000000',0.00,200000.00,650000.00,2600000.00),(6,'97367a6b-0e5f-46c2-8b6e-e6bdd9dd68e6',14,14,6,'2026-11-02 00:00:00.000000','2026-11-05 00:00:00.000000',4,'Completed',3600000.00,900000.00,'2026-10-29 09:00:00.000000','2026-10-30 09:00:00.000000','2026-10-29 11:00:00.000000','2026-10-29 11:00:00.000000',NULL,'2026-11-05 18:00:00.000000',NULL,NULL,NULL,'2026-10-29 09:00:00.000000',0.00,200000.00,850000.00,3400000.00),(7,'03b257a9-4b0f-48de-9361-e2a20e9dd9a9',8,8,7,'2026-11-17 00:00:00.000000','2026-11-20 00:00:00.000000',4,'Ongoing',3600000.00,900000.00,'2026-11-15 14:00:00.000000','2026-11-16 14:00:00.000000','2026-11-15 16:00:00.000000','2026-11-15 16:00:00.000000',NULL,NULL,NULL,NULL,NULL,'2026-11-15 14:00:00.000000',0.00,200000.00,850000.00,3400000.00),(8,'c789fb44-c4c0-4443-9d79-f8aec591c207',11,11,8,'2026-11-16 00:00:00.000000','2026-11-19 00:00:00.000000',4,'Ongoing',5900000.00,1475000.00,'2026-11-14 08:00:00.000000','2026-11-15 08:00:00.000000','2026-11-14 10:00:00.000000','2026-11-14 10:00:00.000000',NULL,NULL,NULL,NULL,NULL,'2026-11-14 08:00:00.000000',100000.00,200000.00,1400000.00,5600000.00),(9,'367cb99f-62a9-49fe-bb53-e1cb4c14f54e',10,10,9,'2026-11-21 00:00:00.000000','2026-11-24 00:00:00.000000',4,'Accepted',2800000.00,700000.00,'2026-11-17 09:00:00.000000','2026-11-18 09:00:00.000000','2026-11-17 11:30:00.000000','2026-11-17 11:30:00.000000',NULL,NULL,NULL,NULL,NULL,'2026-11-17 09:00:00.000000',0.00,200000.00,650000.00,2600000.00),(10,'c789fb44-c4c0-4443-9d79-f8aec591c207',2,2,10,'2026-11-24 00:00:00.000000','2026-11-27 00:00:00.000000',4,'Expired',2600000.00,650000.00,'2026-11-18 09:00:00.000000','2026-11-19 09:00:00.000000',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-18 09:00:00.000000',0.00,200000.00,600000.00,2400000.00),(11,'03b257a9-4b0f-48de-9361-e2a20e9dd9a9',1,1,11,'2026-12-06 00:00:00.000000','2026-12-09 00:00:00.000000',4,'Accepted',3000000.00,750000.00,'2026-11-18 10:00:00.000000','2026-11-19 10:00:00.000000','2026-11-18 12:00:00.000000','2026-11-18 12:00:00.000000',NULL,NULL,NULL,NULL,NULL,'2026-11-18 10:00:00.000000',0.00,200000.00,700000.00,2800000.00),(12,'c789fb44-c4c0-4443-9d79-f8aec591c207',4,4,12,'2026-12-10 00:00:00.000000','2026-12-13 00:00:00.000000',4,'Accepted',5500000.00,1375000.00,'2026-11-17 15:00:00.000000','2026-11-18 15:00:00.000000','2026-11-17 17:00:00.000000','2026-11-17 17:00:00.000000',NULL,NULL,NULL,NULL,NULL,'2026-11-17 15:00:00.000000',100000.00,200000.00,1300000.00,5200000.00),(13,'367cb99f-62a9-49fe-bb53-e1cb4c14f54e',6,6,13,'2026-12-04 00:00:00.000000','2026-12-07 00:00:00.000000',4,'Accepted',2000000.00,500000.00,'2026-11-16 10:00:00.000000','2026-11-17 10:00:00.000000','2026-11-16 14:00:00.000000','2026-11-16 14:00:00.000000',NULL,NULL,NULL,NULL,NULL,'2026-11-16 10:00:00.000000',0.00,200000.00,450000.00,1800000.00),(14,'03b257a9-4b0f-48de-9361-e2a20e9dd9a9',7,7,14,'2026-12-12 00:00:00.000000','2026-12-16 00:00:00.000000',5,'Accepted',5000000.00,1250000.00,'2026-11-17 11:00:00.000000','2026-11-18 11:00:00.000000','2026-11-17 14:00:00.000000','2026-11-17 14:00:00.000000',NULL,NULL,NULL,NULL,NULL,'2026-11-17 11:00:00.000000',0.00,250000.00,950000.00,4750000.00),(15,'c789fb44-c4c0-4443-9d79-f8aec591c207',9,9,15,'2026-12-18 00:00:00.000000','2026-12-21 00:00:00.000000',4,'Accepted',3200000.00,800000.00,'2026-11-16 16:00:00.000000','2026-11-17 16:00:00.000000','2026-11-16 19:00:00.000000','2026-11-16 19:00:00.000000',NULL,NULL,NULL,NULL,NULL,'2026-11-16 16:00:00.000000',0.00,200000.00,750000.00,3000000.00),(16,'367cb99f-62a9-49fe-bb53-e1cb4c14f54e',12,12,16,'2026-12-24 00:00:00.000000','2026-12-27 00:00:00.000000',4,'Accepted',6700000.00,1675000.00,'2026-11-15 10:00:00.000000','2026-11-16 10:00:00.000000','2026-11-15 13:00:00.000000','2026-11-15 13:00:00.000000',NULL,NULL,NULL,NULL,NULL,'2026-11-15 10:00:00.000000',100000.00,200000.00,1600000.00,6400000.00),(17,'03b257a9-4b0f-48de-9361-e2a20e9dd9a9',14,14,17,'2026-12-15 00:00:00.000000','2026-12-18 00:00:00.000000',4,'Accepted',3600000.00,900000.00,'2026-11-17 13:00:00.000000','2026-11-18 13:00:00.000000','2026-11-17 15:00:00.000000','2026-11-17 15:00:00.000000',NULL,NULL,NULL,NULL,NULL,'2026-11-17 13:00:00.000000',0.00,200000.00,850000.00,3400000.00),(18,'c789fb44-c4c0-4443-9d79-f8aec591c207',15,15,18,'2026-12-20 00:00:00.000000','2026-12-23 00:00:00.000000',4,'Expired',5100000.00,1275000.00,'2026-11-18 11:00:00.000000','2026-11-19 11:00:00.000000',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-18 11:00:00.000000',100000.00,200000.00,1200000.00,4800000.00),(19,'367cb99f-62a9-49fe-bb53-e1cb4c14f54e',5,5,19,'2026-12-15 00:00:00.000000','2026-12-18 00:00:00.000000',4,'Cancelled',6200000.00,1550000.00,'2026-11-14 09:00:00.000000','2026-11-15 09:00:00.000000',NULL,NULL,NULL,NULL,'2026-11-16 10:00:00.000000','367cb99f-62a9-49fe-bb53-e1cb4c14f54e','Gia đình có việc bận đột xuất nên dời lịch trình công tác sang tháng 1.','2026-11-14 09:00:00.000000',0.00,200000.00,1500000.00,6000000.00),(20,'03b257a9-4b0f-48de-9361-e2a20e9dd9a9',2,2,20,'2026-12-08 00:00:00.000000','2026-12-11 00:00:00.000000',4,'Rejected',2600000.00,650000.00,'2026-11-15 14:00:00.000000','2026-11-16 14:00:00.000000',NULL,'2026-11-15 17:00:00.000000','Xe đã có lịch bảo dưỡng và bảo hiểm định kỳ đợt cuối năm, rất tiếc không phục vụ được bạn.',NULL,NULL,NULL,NULL,'2026-11-15 14:00:00.000000',0.00,200000.00,600000.00,2400000.00),(21,'367cb99f-62a9-49fe-bb53-e1cb4c14f54e',1,1,21,'2027-01-01 00:00:00.000000','2027-01-04 00:00:00.000000',4,'Accepted',3100000.00,775000.00,'2026-11-16 08:00:00.000000','2026-11-17 08:00:00.000000','2026-11-16 10:00:00.000000','2026-11-16 10:00:00.000000',NULL,NULL,NULL,NULL,NULL,'2026-11-16 08:00:00.000000',100000.00,200000.00,700000.00,2800000.00),(22,'c789fb44-c4c0-4443-9d79-f8aec591c207',3,3,22,'2027-01-02 00:00:00.000000','2027-01-05 00:00:00.000000',4,'Accepted',4600000.00,1150000.00,'2026-11-17 09:00:00.000000','2026-11-18 09:00:00.000000','2026-11-17 11:00:00.000000','2026-11-17 11:00:00.000000',NULL,NULL,NULL,NULL,NULL,'2026-11-17 09:00:00.000000',0.00,200000.00,1100000.00,4400000.00),(23,'03b257a9-4b0f-48de-9361-e2a20e9dd9a9',5,5,23,'2027-01-08 00:00:00.000000','2027-01-12 00:00:00.000000',5,'Accepted',7750000.00,1937500.00,'2026-11-16 14:00:00.000000','2026-11-17 14:00:00.000000','2026-11-16 17:00:00.000000','2026-11-16 17:00:00.000000',NULL,NULL,NULL,NULL,NULL,'2026-11-16 14:00:00.000000',0.00,250000.00,1500000.00,7500000.00),(24,'367cb99f-62a9-49fe-bb53-e1cb4c14f54e',8,8,24,'2027-01-05 00:00:00.000000','2027-01-09 00:00:00.000000',5,'Accepted',4500000.00,1125000.00,'2026-11-17 10:00:00.000000','2026-11-18 10:00:00.000000','2026-11-17 12:00:00.000000','2026-11-17 12:00:00.000000',NULL,NULL,NULL,NULL,NULL,'2026-11-17 10:00:00.000000',0.00,250000.00,850000.00,4250000.00),(25,'c789fb44-c4c0-4443-9d79-f8aec591c207',10,10,25,'2027-01-10 00:00:00.000000','2027-01-13 00:00:00.000000',4,'Accepted',2800000.00,700000.00,'2026-11-15 11:00:00.000000','2026-11-16 11:00:00.000000','2026-11-15 14:00:00.000000','2026-11-15 14:00:00.000000',NULL,NULL,NULL,NULL,NULL,'2026-11-15 11:00:00.000000',0.00,200000.00,650000.00,2600000.00),(26,'03b257a9-4b0f-48de-9361-e2a20e9dd9a9',11,11,26,'2027-01-15 00:00:00.000000','2027-01-19 00:00:00.000000',5,'Accepted',7350000.00,1837500.00,'2026-11-16 15:00:00.000000','2026-11-17 15:00:00.000000','2026-11-16 18:00:00.000000','2026-11-16 18:00:00.000000',NULL,NULL,NULL,NULL,NULL,'2026-11-16 15:00:00.000000',100000.00,250000.00,1400000.00,7000000.00),(27,'367cb99f-62a9-49fe-bb53-e1cb4c14f54e',13,13,27,'2027-01-08 00:00:00.000000','2027-01-11 00:00:00.000000',4,'Accepted',2800000.00,700000.00,'2026-11-17 14:00:00.000000','2026-11-18 14:00:00.000000','2026-11-17 16:00:00.000000','2026-11-17 16:00:00.000000',NULL,NULL,NULL,NULL,NULL,'2026-11-17 14:00:00.000000',0.00,200000.00,650000.00,2600000.00),(28,'c789fb44-c4c0-4443-9d79-f8aec591c207',14,14,28,'2027-01-12 00:00:00.000000','2027-01-15 00:00:00.000000',4,'Accepted',3600000.00,900000.00,'2026-11-16 09:00:00.000000','2026-11-17 09:00:00.000000','2026-11-16 11:00:00.000000','2026-11-16 11:00:00.000000',NULL,NULL,NULL,NULL,NULL,'2026-11-16 09:00:00.000000',0.00,200000.00,850000.00,3400000.00),(29,'03b257a9-4b0f-48de-9361-e2a20e9dd9a9',15,15,29,'2027-01-20 00:00:00.000000','2027-01-24 00:00:00.000000',5,'Expired',6250000.00,1562500.00,'2026-11-18 08:30:00.000000','2026-11-19 08:30:00.000000',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-18 08:30:00.000000',0.00,250000.00,1200000.00,6000000.00),(30,'367cb99f-62a9-49fe-bb53-e1cb4c14f54e',4,4,30,'2027-01-18 00:00:00.000000','2027-01-21 00:00:00.000000',4,'Cancelled',5400000.00,1350000.00,'2026-11-14 10:00:00.000000','2026-11-15 10:00:00.000000','2026-11-14 12:00:00.000000','2026-11-14 12:00:00.000000',NULL,NULL,'2026-11-15 14:00:00.000000','bfbc3599-9953-4a0f-9ebf-3d9863b49bdf','Hủy bởi Admin do lỗi chủ xe: Chủ xe tự ý đơn phương hủy thỏa thuận sau khi đã duyệt và nhận cọc của khách thuê.','2026-11-14 10:00:00.000000',0.00,200000.00,1300000.00,5200000.00),(31,'97367a6b-0e5f-46c2-8b6e-e6bdd9dd68e6',7,7,31,'2027-01-15 08:00:00.000000','2027-01-18 08:00:00.000000',4,'Rejected',4000000.00,1000000.00,'2026-11-18 09:06:44.461680','2026-11-19 09:06:44.461680',NULL,'2026-11-18 09:06:45.107638','Chủ xe bận lịch hoặc không thể phục vụ chuyến đi này.',NULL,NULL,NULL,NULL,'2026-11-18 09:06:44.808365',0.00,200000.00,950000.00,3800000.00),(32,'97367a6b-0e5f-46c2-8b6e-e6bdd9dd68e6',7,7,32,'2027-01-15 08:00:00.000000','2027-01-18 08:00:00.000000',4,'Completed',4000000.00,1000000.00,'2026-11-18 09:07:33.167145','2026-11-19 09:07:33.167145','2026-11-18 09:07:33.377133','2026-11-18 09:07:33.377133',NULL,'2026-11-18 09:07:33.554459',NULL,NULL,NULL,'2026-11-18 09:07:33.205223',0.00,200000.00,950000.00,3800000.00);
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `deposit_holds`
--

DROP TABLE IF EXISTS `deposit_holds`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `deposit_holds` (
  `hold_id` int NOT NULL AUTO_INCREMENT,
  `renter_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `listing_id` int NOT NULL,
  `start_date` datetime(6) NOT NULL,
  `end_date` datetime(6) NOT NULL,
  `rental_days` int NOT NULL,
  `price_locked_total` decimal(12,2) NOT NULL,
  `deposit_amount` decimal(12,2) NOT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  PRIMARY KEY (`hold_id`),
  KEY `IX_deposit_holds_listing_id` (`listing_id`),
  KEY `IX_deposit_holds_renter_id` (`renter_id`),
  CONSTRAINT `FK_deposit_holds_users_renter_id` FOREIGN KEY (`renter_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT,
  CONSTRAINT `FK_deposit_holds_vehicle_listings_listing_id` FOREIGN KEY (`listing_id`) REFERENCES `vehicle_listings` (`listing_id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deposit_holds`
--

LOCK TABLES `deposit_holds` WRITE;
/*!40000 ALTER TABLE `deposit_holds` DISABLE KEYS */;
INSERT INTO `deposit_holds` VALUES (1,'367cb99f-62a9-49fe-bb53-e1cb4c14f54e',1,'2026-11-01 00:00:00.000000','2026-11-04 00:00:00.000000',4,3100000.00,775000.00,'Converted','2026-10-28 10:00:00.000000'),(2,'03b257a9-4b0f-48de-9361-e2a20e9dd9a9',3,'2026-11-05 00:00:00.000000','2026-11-08 00:00:00.000000',4,4600000.00,1150000.00,'Converted','2026-11-02 09:00:00.000000'),(3,'c789fb44-c4c0-4443-9d79-f8aec591c207',7,'2026-11-03 00:00:00.000000','2026-11-06 00:00:00.000000',4,4000000.00,1000000.00,'Converted','2026-10-31 14:00:00.000000'),(4,'367cb99f-62a9-49fe-bb53-e1cb4c14f54e',9,'2026-11-08 00:00:00.000000','2026-11-11 00:00:00.000000',4,3300000.00,825000.00,'Converted','2026-11-05 08:30:00.000000'),(5,'03b257a9-4b0f-48de-9361-e2a20e9dd9a9',13,'2026-11-10 00:00:00.000000','2026-11-13 00:00:00.000000',4,2800000.00,700000.00,'Converted','2026-11-07 10:00:00.000000'),(6,'97367a6b-0e5f-46c2-8b6e-e6bdd9dd68e6',14,'2026-11-02 00:00:00.000000','2026-11-05 00:00:00.000000',4,3600000.00,900000.00,'Converted','2026-10-29 09:00:00.000000'),(7,'03b257a9-4b0f-48de-9361-e2a20e9dd9a9',8,'2026-11-17 00:00:00.000000','2026-11-20 00:00:00.000000',4,3600000.00,900000.00,'Converted','2026-11-15 14:00:00.000000'),(8,'c789fb44-c4c0-4443-9d79-f8aec591c207',11,'2026-11-16 00:00:00.000000','2026-11-19 00:00:00.000000',4,5900000.00,1475000.00,'Converted','2026-11-14 08:00:00.000000'),(9,'367cb99f-62a9-49fe-bb53-e1cb4c14f54e',10,'2026-11-21 00:00:00.000000','2026-11-24 00:00:00.000000',4,2800000.00,700000.00,'Converted','2026-11-17 09:00:00.000000'),(10,'c789fb44-c4c0-4443-9d79-f8aec591c207',2,'2026-11-24 00:00:00.000000','2026-11-27 00:00:00.000000',4,2600000.00,650000.00,'Cancelled','2026-11-18 09:00:00.000000'),(11,'03b257a9-4b0f-48de-9361-e2a20e9dd9a9',1,'2026-12-06 00:00:00.000000','2026-12-09 00:00:00.000000',4,3000000.00,750000.00,'Converted','2026-11-18 10:00:00.000000'),(12,'c789fb44-c4c0-4443-9d79-f8aec591c207',4,'2026-12-10 00:00:00.000000','2026-12-13 00:00:00.000000',4,5500000.00,1375000.00,'Converted','2026-11-17 15:00:00.000000'),(13,'367cb99f-62a9-49fe-bb53-e1cb4c14f54e',6,'2026-12-04 00:00:00.000000','2026-12-07 00:00:00.000000',4,2000000.00,500000.00,'Converted','2026-11-16 10:00:00.000000'),(14,'03b257a9-4b0f-48de-9361-e2a20e9dd9a9',7,'2026-12-12 00:00:00.000000','2026-12-16 00:00:00.000000',5,5000000.00,1250000.00,'Converted','2026-11-17 11:00:00.000000'),(15,'c789fb44-c4c0-4443-9d79-f8aec591c207',9,'2026-12-18 00:00:00.000000','2026-12-21 00:00:00.000000',4,3200000.00,800000.00,'Converted','2026-11-16 16:00:00.000000'),(16,'367cb99f-62a9-49fe-bb53-e1cb4c14f54e',12,'2026-12-24 00:00:00.000000','2026-12-27 00:00:00.000000',4,6700000.00,1675000.00,'Converted','2026-11-15 10:00:00.000000'),(17,'03b257a9-4b0f-48de-9361-e2a20e9dd9a9',14,'2026-12-15 00:00:00.000000','2026-12-18 00:00:00.000000',4,3600000.00,900000.00,'Converted','2026-11-17 13:00:00.000000'),(18,'c789fb44-c4c0-4443-9d79-f8aec591c207',15,'2026-12-20 00:00:00.000000','2026-12-23 00:00:00.000000',4,5100000.00,1275000.00,'Cancelled','2026-11-18 11:00:00.000000'),(19,'367cb99f-62a9-49fe-bb53-e1cb4c14f54e',5,'2026-12-15 00:00:00.000000','2026-12-18 00:00:00.000000',4,6200000.00,1550000.00,'Cancelled','2026-11-14 09:00:00.000000'),(20,'03b257a9-4b0f-48de-9361-e2a20e9dd9a9',2,'2026-12-08 00:00:00.000000','2026-12-11 00:00:00.000000',4,2600000.00,650000.00,'Cancelled','2026-11-15 14:00:00.000000'),(21,'367cb99f-62a9-49fe-bb53-e1cb4c14f54e',1,'2027-01-01 00:00:00.000000','2027-01-04 00:00:00.000000',4,3100000.00,775000.00,'Converted','2026-11-16 08:00:00.000000'),(22,'c789fb44-c4c0-4443-9d79-f8aec591c207',3,'2027-01-02 00:00:00.000000','2027-01-05 00:00:00.000000',4,4600000.00,1150000.00,'Converted','2026-11-17 09:00:00.000000'),(23,'03b257a9-4b0f-48de-9361-e2a20e9dd9a9',5,'2027-01-08 00:00:00.000000','2027-01-12 00:00:00.000000',5,7750000.00,1937500.00,'Converted','2026-11-16 14:00:00.000000'),(24,'367cb99f-62a9-49fe-bb53-e1cb4c14f54e',8,'2027-01-05 00:00:00.000000','2027-01-09 00:00:00.000000',5,4500000.00,1125000.00,'Converted','2026-11-17 10:00:00.000000'),(25,'c789fb44-c4c0-4443-9d79-f8aec591c207',10,'2027-01-10 00:00:00.000000','2027-01-13 00:00:00.000000',4,2800000.00,700000.00,'Converted','2026-11-15 11:00:00.000000'),(26,'03b257a9-4b0f-48de-9361-e2a20e9dd9a9',11,'2027-01-15 00:00:00.000000','2027-01-19 00:00:00.000000',5,7350000.00,1837500.00,'Converted','2026-11-16 15:00:00.000000'),(27,'367cb99f-62a9-49fe-bb53-e1cb4c14f54e',13,'2027-01-08 00:00:00.000000','2027-01-11 00:00:00.000000',4,2800000.00,700000.00,'Converted','2026-11-17 14:00:00.000000'),(28,'c789fb44-c4c0-4443-9d79-f8aec591c207',14,'2027-01-12 00:00:00.000000','2027-01-15 00:00:00.000000',4,3600000.00,900000.00,'Converted','2026-11-16 09:00:00.000000'),(29,'03b257a9-4b0f-48de-9361-e2a20e9dd9a9',15,'2027-01-20 00:00:00.000000','2027-01-24 00:00:00.000000',5,6250000.00,1562500.00,'Cancelled','2026-11-18 08:30:00.000000'),(30,'367cb99f-62a9-49fe-bb53-e1cb4c14f54e',4,'2027-01-18 00:00:00.000000','2027-01-21 00:00:00.000000',4,5400000.00,1350000.00,'Cancelled','2026-11-14 10:00:00.000000'),(31,'97367a6b-0e5f-46c2-8b6e-e6bdd9dd68e6',7,'2027-01-15 08:00:00.000000','2027-01-18 08:00:00.000000',4,4000000.00,1000000.00,'Cancelled','2026-11-18 09:06:44.461680'),(32,'97367a6b-0e5f-46c2-8b6e-e6bdd9dd68e6',7,'2027-01-15 08:00:00.000000','2027-01-18 08:00:00.000000',4,4000000.00,1000000.00,'Converted','2026-11-18 09:07:33.167145');
/*!40000 ALTER TABLE `deposit_holds` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `disputes`
--

DROP TABLE IF EXISTS `disputes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `disputes` (
  `dispute_id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `raised_by` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `evidence_image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `resolved_by` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `resolved_at` datetime(6) DEFAULT NULL,
  `resolution_action` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `resolution_notes` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `proposed_amount` decimal(18,2) DEFAULT NULL,
  PRIMARY KEY (`dispute_id`),
  KEY `IX_disputes_booking_id` (`booking_id`),
  KEY `IX_disputes_raised_by` (`raised_by`),
  KEY `IX_disputes_resolved_by` (`resolved_by`),
  CONSTRAINT `FK_disputes_bookings_booking_id` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE RESTRICT,
  CONSTRAINT `FK_disputes_users_raised_by` FOREIGN KEY (`raised_by`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT,
  CONSTRAINT `FK_disputes_users_resolved_by` FOREIGN KEY (`resolved_by`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `disputes`
--

LOCK TABLES `disputes` WRITE;
/*!40000 ALTER TABLE `disputes` DISABLE KEYS */;
INSERT INTO `disputes` VALUES (1,5,'03b257a9-4b0f-48de-9361-e2a20e9dd9a9','Chủ xe yêu cầu giữ lại 500.000đ tiền đặt cọc vì lý do có vết trầy xước ở mép cản dưới bên phụ. Tôi khẳng định vết xước này đã có sẵn khi nhận xe.','/seed/dispute-evidence-2.jpg','Resolved','2026-11-13 01:00:00.000000','eea6da54-0e36-411e-a412-b3a3f85f94ac','2026-11-13 04:00:00.000000','ForceComplete','Đã đối chiếu hình ảnh chụp lúc nhận xe trong biên bản bàn giao: vết trầy xước cản dưới đã có từ trước chuyến đi. Quyết định hoàn đủ 100% cọc cho khách thuê và hoàn tất thanh toán doanh thu cho chủ xe theo quy định sàn.',NULL,NULL),(2,8,'c789fb44-c4c0-4443-9d79-f8aec591c207','Khi nhận xe chạy được khoảng 30km trên cao tốc thì hệ thống điều hòa ngừng làm mát, khoang xe phả hơi nóng bức bí và bảng taplo xuất hiện đèn báo check-engine nhấp nháy. Tôi đã liên hệ chủ xe nhiều lần nhưng không được phản hồi, đề nghị Ban quản trị sàn can thiệp khẩn cấp hỗ trợ giải quyết sự cố kỹ thuật này.','/seed/dispute-evidence-1.jpg','Open','2026-11-17 22:00:00.000000',NULL,NULL,NULL,NULL,NULL,NULL),(3,30,'367cb99f-62a9-49fe-bb53-e1cb4c14f54e','Chủ xe tự ý đơn phương hủy hợp đồng sau khi đã duyệt thỏa thuận thuê xe, gây gián đoạn lịch trình công tác của tôi.','/seed/dispute-evidence-2.jpg','Resolved','2026-11-15 12:00:00.000000','bfbc3599-9953-4a0f-9ebf-3d9863b49bdf','2026-11-15 14:00:00.000000','CancelOwnerFault','Xác minh chủ xe tự ý hủy chuyến đã duyệt. Phán quyết hủy đơn, hoàn 100 phần trăm tiền cọc (1,350,000đ) cho khách thuê và áp dụng chế tài phạt 8 phần trăm giá trị hợp đồng (432,000đ) đối với chủ xe theo quy chế sàn.',NULL,NULL);
/*!40000 ALTER TABLE `disputes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `driver_licenses`
--

DROP TABLE IF EXISTS `driver_licenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `driver_licenses` (
  `user_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `license_number` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `license_class` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `expiry_date` date NOT NULL,
  `image_front` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `IX_driver_licenses_license_number` (`license_number`),
  CONSTRAINT `FK_driver_licenses_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `driver_licenses`
--

LOCK TABLES `driver_licenses` WRITE;
/*!40000 ALTER TABLE `driver_licenses` DISABLE KEYS */;
INSERT INTO `driver_licenses` VALUES ('03b257a9-4b0f-48de-9361-e2a20e9dd9a9','GPLX-RENTER2','B2','2031-10-28','seed/license-renter2.jpg'),('259866f6-f66d-496e-8826-e36699690acb','GPLX-OWNER2','B2','2031-10-28','seed/license-owner2.jpg'),('367cb99f-62a9-49fe-bb53-e1cb4c14f54e','GPLX-RENTER1','B2','2031-10-28','seed/license-renter1.jpg'),('3bb5fa2f-d7e3-4e08-a339-bde28bbb082a','GPLX-OWNER4','B2','2031-10-28','seed/license-owner4.jpg'),('90676bac-ce48-469c-982a-295592067f49','GPLX-OWNER3','B2','2031-10-28','seed/license-owner3.jpg'),('97367a6b-0e5f-46c2-8b6e-e6bdd9dd68e6','GPLX-RENTER4','B2','2031-10-28','seed/license-renter4.jpg'),('c789fb44-c4c0-4443-9d79-f8aec591c207','GPLX-RENTER3','B2','2031-10-28','seed/license-renter3.jpg'),('f18c8154-3883-42b9-b173-014013b7cd2e','GPLX-OWNER1','B2','2031-10-28','seed/license-owner1.jpg');
/*!40000 ALTER TABLE `driver_licenses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `handover_confirmations`
--

DROP TABLE IF EXISTS `handover_confirmations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `handover_confirmations` (
  `confirmation_id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `confirmed_by` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `confirmed_at` datetime(6) NOT NULL,
  `fuel_level` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `notes` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `odometer` int DEFAULT NULL,
  `remaining_payment_method` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`confirmation_id`),
  UNIQUE KEY `IX_handover_confirmations_booking_id_type_confirmed_by` (`booking_id`,`type`,`confirmed_by`),
  KEY `IX_handover_confirmations_confirmed_by` (`confirmed_by`),
  CONSTRAINT `FK_handover_confirmations_bookings_booking_id` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE RESTRICT,
  CONSTRAINT `FK_handover_confirmations_users_confirmed_by` FOREIGN KEY (`confirmed_by`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `handover_confirmations`
--

LOCK TABLES `handover_confirmations` WRITE;
/*!40000 ALTER TABLE `handover_confirmations` DISABLE KEYS */;
INSERT INTO `handover_confirmations` VALUES (1,1,'Pickup','367cb99f-62a9-49fe-bb53-e1cb4c14f54e','2026-11-01 00:00:00.000000','Full','Nhận xe đúng giờ, ngoại thất và nội thất sạch sẽ.',18200,NULL),(2,1,'Pickup','f18c8154-3883-42b9-b173-014013b7cd2e','2026-11-01 00:05:00.000000','Full','Đã bàn giao chìa khóa và giấy tờ xe đầy đủ cho khách.',18200,NULL),(3,1,'Return','367cb99f-62a9-49fe-bb53-e1cb4c14f54e','2026-11-04 00:00:00.000000','Full','Trả xe đúng hạn, xe vận hành rất tốt và êm ái.',18650,'Cash'),(4,1,'Return','f18c8154-3883-42b9-b173-014013b7cd2e','2026-11-04 00:10:00.000000','Full','Đã nhận lại xe nguyên vẹn, nhận đủ 75 phần trăm tiền mặt còn lại.',18650,'Cash'),(5,2,'Pickup','03b257a9-4b0f-48de-9361-e2a20e9dd9a9','2026-11-05 00:00:00.000000','Full','Nhận xe đúng giờ, ngoại thất và nội thất sạch sẽ.',12100,NULL),(6,2,'Pickup','259866f6-f66d-496e-8826-e36699690acb','2026-11-05 00:05:00.000000','Full','Đã bàn giao chìa khóa và giấy tờ xe đầy đủ cho khách.',12100,NULL),(7,2,'Return','03b257a9-4b0f-48de-9361-e2a20e9dd9a9','2026-11-08 00:00:00.000000','Full','Trả xe đúng hạn, xe vận hành rất tốt và êm ái.',12480,'Cash'),(8,2,'Return','259866f6-f66d-496e-8826-e36699690acb','2026-11-08 00:10:00.000000','Full','Đã nhận lại xe nguyên vẹn, nhận đủ 75 phần trăm tiền mặt còn lại.',12480,'Cash'),(9,3,'Pickup','c789fb44-c4c0-4443-9d79-f8aec591c207','2026-11-03 00:00:00.000000','Full','Nhận xe đúng giờ, ngoại thất và nội thất sạch sẽ.',15300,NULL),(10,3,'Pickup','f18c8154-3883-42b9-b173-014013b7cd2e','2026-11-03 00:05:00.000000','Full','Đã bàn giao chìa khóa và giấy tờ xe đầy đủ cho khách.',15300,NULL),(11,3,'Return','c789fb44-c4c0-4443-9d79-f8aec591c207','2026-11-06 00:00:00.000000','Full','Trả xe đúng hạn, xe vận hành rất tốt và êm ái.',15820,'Cash'),(12,3,'Return','f18c8154-3883-42b9-b173-014013b7cd2e','2026-11-06 00:10:00.000000','Full','Đã nhận lại xe nguyên vẹn, nhận đủ 75 phần trăm tiền mặt còn lại.',15820,'Cash'),(13,4,'Pickup','367cb99f-62a9-49fe-bb53-e1cb4c14f54e','2026-11-08 00:00:00.000000','Full','Nhận xe đúng giờ, ngoại thất và nội thất sạch sẽ.',9200,NULL),(14,4,'Pickup','259866f6-f66d-496e-8826-e36699690acb','2026-11-08 00:05:00.000000','Full','Đã bàn giao chìa khóa và giấy tờ xe đầy đủ cho khách.',9200,NULL),(15,4,'Return','367cb99f-62a9-49fe-bb53-e1cb4c14f54e','2026-11-11 00:00:00.000000','Full','Trả xe đúng hạn, xe vận hành rất tốt và êm ái.',9650,'Cash'),(16,4,'Return','259866f6-f66d-496e-8826-e36699690acb','2026-11-11 00:10:00.000000','Full','Đã nhận lại xe nguyên vẹn, nhận đủ 75 phần trăm tiền mặt còn lại.',9650,'Cash'),(17,5,'Pickup','03b257a9-4b0f-48de-9361-e2a20e9dd9a9','2026-11-10 00:00:00.000000','Full','Nhận xe đúng giờ, ngoại thất và nội thất sạch sẽ.',21400,NULL),(18,5,'Pickup','f18c8154-3883-42b9-b173-014013b7cd2e','2026-11-10 00:05:00.000000','Full','Đã bàn giao chìa khóa và giấy tờ xe đầy đủ cho khách.',21400,NULL),(19,5,'Return','03b257a9-4b0f-48de-9361-e2a20e9dd9a9','2026-11-13 00:00:00.000000','Full','Trả xe đúng hạn, xe vận hành rất tốt và êm ái.',21860,'Cash'),(20,5,'Return','f18c8154-3883-42b9-b173-014013b7cd2e','2026-11-13 00:10:00.000000','Full','Đã nhận lại xe nguyên vẹn, nhận đủ 75 phần trăm tiền mặt còn lại.',21860,'Cash'),(21,6,'Pickup','97367a6b-0e5f-46c2-8b6e-e6bdd9dd68e6','2026-11-02 00:00:00.000000','Full','Nhận xe đúng giờ, ngoại thất và nội thất sạch sẽ.',10500,NULL),(22,6,'Pickup','259866f6-f66d-496e-8826-e36699690acb','2026-11-02 00:05:00.000000','Full','Đã bàn giao chìa khóa và giấy tờ xe đầy đủ cho khách.',10500,NULL),(23,6,'Return','97367a6b-0e5f-46c2-8b6e-e6bdd9dd68e6','2026-11-05 00:00:00.000000','Full','Trả xe đúng hạn, xe vận hành rất tốt và êm ái.',10920,'Cash'),(24,6,'Return','259866f6-f66d-496e-8826-e36699690acb','2026-11-05 00:10:00.000000','Full','Đã nhận lại xe nguyên vẹn, nhận đủ 75 phần trăm tiền mặt còn lại.',10920,'Cash'),(25,7,'Pickup','03b257a9-4b0f-48de-9361-e2a20e9dd9a9','2026-11-17 00:00:00.000000','Full','Đã nhận xe, kiểm tra thân vỏ xe hoạt động tốt.',24150,NULL),(26,7,'Pickup','f18c8154-3883-42b9-b173-014013b7cd2e','2026-11-17 00:05:00.000000','Full','Đã bàn giao xe và đầy đủ giấy tờ cho khách.',24150,NULL),(27,8,'Pickup','c789fb44-c4c0-4443-9d79-f8aec591c207','2026-11-16 00:00:00.000000','Full','Đã nhận xe, kiểm tra thân vỏ xe hoạt động tốt.',38500,NULL),(28,8,'Pickup','90676bac-ce48-469c-982a-295592067f49','2026-11-16 00:05:00.000000','Full','Đã bàn giao xe và đầy đủ giấy tờ cho khách.',38500,NULL),(29,32,'Pickup','f18c8154-3883-42b9-b173-014013b7cd2e','2026-11-18 09:07:33.409876','8/8','Xe sạch sẽ, ngoại thất không trầy xước, đầy đủ lốp dự phòng và con đội',15200,'cash'),(30,32,'Return','f18c8154-3883-42b9-b173-014013b7cd2e','2026-11-18 09:07:33.554459','8/8','Xe hoàn trả đúng hẹn, nguyên vẹn, đã kiểm tra đầy đủ phụ kiện',15580,'cash');
/*!40000 ALTER TABLE `handover_confirmations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `listing_images`
--

DROP TABLE IF EXISTS `listing_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `listing_images` (
  `image_id` int NOT NULL AUTO_INCREMENT,
  `listing_id` int NOT NULL,
  `image_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `sort_order` int NOT NULL,
  `is_cover` tinyint(1) NOT NULL,
  PRIMARY KEY (`image_id`),
  KEY `IX_listing_images_listing_id` (`listing_id`),
  CONSTRAINT `FK_listing_images_vehicle_listings_listing_id` FOREIGN KEY (`listing_id`) REFERENCES `vehicle_listings` (`listing_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `listing_images`
--

LOCK TABLES `listing_images` WRITE;
/*!40000 ALTER TABLE `listing_images` DISABLE KEYS */;
INSERT INTO `listing_images` VALUES (1,1,'/seed/car1-1.jpg',1,1),(2,1,'/seed/car1-2.jpg',2,0),(3,1,'/seed/car1-3.jpg',3,0),(4,2,'/seed/car2-1.jpg',1,1),(5,2,'/seed/car2-2.jpg',2,0),(6,2,'/seed/car2-3.jpg',3,0),(7,3,'/seed/car3-1.jpg',1,1),(8,3,'/seed/car3-2.jpg',2,0),(9,3,'/seed/car3-3.jpg',3,0),(10,4,'/seed/car4-1.jpg',1,1),(11,4,'/seed/car4-2.jpg',2,0),(12,4,'/seed/car4-3.jpg',3,0),(13,5,'/seed/car5-1.jpg',1,1),(14,5,'/seed/car5-2.jpg',2,0),(15,5,'/seed/car5-3.jpg',3,0),(16,6,'/seed/car6-1.jpg',1,1),(17,6,'/seed/car6-2.jpg',2,0),(18,6,'/seed/car6-3.jpg',3,0),(19,7,'/seed/car7-1.jpg',1,1),(20,7,'/seed/car7-2.jpg',2,0),(21,7,'/seed/car7-3.jpg',3,0),(22,8,'/seed/car8-1.jpg',1,1),(23,8,'/seed/car8-2.jpg',2,0),(24,8,'/seed/car8-3.jpg',3,0),(25,9,'/seed/car9-1.jpg',1,1),(26,9,'/seed/car9-2.jpg',2,0),(27,9,'/seed/car9-3.jpg',3,0),(28,10,'/seed/car10-1.jpg',1,1),(29,10,'/seed/car10-2.jpg',2,0),(30,10,'/seed/car10-3.jpg',3,0),(31,11,'/seed/car11-1.jpg',1,1),(32,11,'/seed/car11-2.jpg',2,0),(33,11,'/seed/car11-3.jpg',3,0),(34,12,'/seed/car12-1.jpg',1,1),(35,12,'/seed/car12-2.jpg',2,0),(36,12,'/seed/car12-3.jpg',3,0),(37,13,'/seed/car13-1.jpg',1,1),(38,13,'/seed/car13-2.jpg',2,0),(39,13,'/seed/car13-3.jpg',3,0),(40,14,'/seed/car14-1.jpg',1,1),(41,14,'/seed/car14-2.jpg',2,0),(42,14,'/seed/car14-3.jpg',3,0),(43,15,'/seed/car15-1.jpg',1,1),(44,15,'/seed/car15-2.jpg',2,0),(45,15,'/seed/car15-3.jpg',3,0),(46,16,'/seed/car16-1.jpg',1,1),(47,16,'/seed/car16-2.jpg',2,0),(48,16,'/seed/car16-3.jpg',3,0),(49,17,'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=600',1,1),(50,18,'/seed/car17-1.jpg',1,1),(51,18,'/seed/car17-2.jpg',2,0),(52,18,'/seed/car17-3.jpg',3,0),(53,19,'/seed/car18-1.jpg',1,1),(54,19,'/seed/car18-2.jpg',2,0),(55,19,'/seed/car18-3.jpg',3,0),(56,20,'/seed/car19-1.jpg',1,1),(57,20,'/seed/car19-2.jpg',2,0),(58,20,'/seed/car19-3.jpg',3,0);
/*!40000 ALTER TABLE `listing_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mock_bank_accounts`
--

DROP TABLE IF EXISTS `mock_bank_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mock_bank_accounts` (
  `account_id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `account_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `account_number` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  PRIMARY KEY (`account_id`),
  UNIQUE KEY `IX_mock_bank_accounts_account_number` (`account_number`),
  UNIQUE KEY `IX_mock_bank_accounts_user_id` (`user_id`),
  CONSTRAINT `FK_mock_bank_accounts_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mock_bank_accounts`
--

LOCK TABLES `mock_bank_accounts` WRITE;
/*!40000 ALTER TABLE `mock_bank_accounts` DISABLE KEYS */;
INSERT INTO `mock_bank_accounts` VALUES (1,NULL,'PlatformEscrow','ESCROW-0001','Active','2026-10-28 15:52:24.818122'),(2,'367cb99f-62a9-49fe-bb53-e1cb4c14f54e','User','MOCK-RENTER1','Active','2026-10-28 15:52:24.836782'),(3,'03b257a9-4b0f-48de-9361-e2a20e9dd9a9','User','MOCK-RENTER2','Active','2026-10-28 15:52:24.838196'),(4,'c789fb44-c4c0-4443-9d79-f8aec591c207','User','MOCK-RENTER3','Active','2026-10-28 15:52:24.838278'),(5,'f18c8154-3883-42b9-b173-014013b7cd2e','User','MOCK-OWNER1','Active','2026-10-28 15:52:24.838318'),(6,'259866f6-f66d-496e-8826-e36699690acb','User','MOCK-OWNER2','Active','2026-10-28 15:52:24.838352'),(7,'90676bac-ce48-469c-982a-295592067f49','User','MOCK-OWNER3','Active','2026-10-28 15:52:24.838378'),(8,'97367a6b-0e5f-46c2-8b6e-e6bdd9dd68e6','User','MOCK-RENTER4','Active','2026-10-28 19:57:23.382295'),(9,'3bb5fa2f-d7e3-4e08-a339-bde28bbb082a','User','MOCK-OWNER4','Active','2026-10-28 19:57:23.423822');
/*!40000 ALTER TABLE `mock_bank_accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mock_bank_transactions`
--

DROP TABLE IF EXISTS `mock_bank_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mock_bank_transactions` (
  `transaction_id` int NOT NULL AUTO_INCREMENT,
  `reference_code` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `payment_id` int DEFAULT NULL,
  `from_account_id` int NOT NULL,
  `to_account_id` int NOT NULL,
  `transaction_type` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  PRIMARY KEY (`transaction_id`),
  UNIQUE KEY `IX_mock_bank_transactions_reference_code` (`reference_code`),
  KEY `IX_mock_bank_transactions_from_account_id` (`from_account_id`),
  KEY `IX_mock_bank_transactions_payment_id` (`payment_id`),
  KEY `IX_mock_bank_transactions_to_account_id` (`to_account_id`),
  CONSTRAINT `FK_mock_bank_transactions_mock_bank_accounts_from_account_id` FOREIGN KEY (`from_account_id`) REFERENCES `mock_bank_accounts` (`account_id`) ON DELETE RESTRICT,
  CONSTRAINT `FK_mock_bank_transactions_mock_bank_accounts_to_account_id` FOREIGN KEY (`to_account_id`) REFERENCES `mock_bank_accounts` (`account_id`) ON DELETE RESTRICT,
  CONSTRAINT `FK_mock_bank_transactions_payments_payment_id` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`payment_id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mock_bank_transactions`
--

LOCK TABLES `mock_bank_transactions` WRITE;
/*!40000 ALTER TABLE `mock_bank_transactions` DISABLE KEYS */;
INSERT INTO `mock_bank_transactions` VALUES (1,'DEP-1',1,2,1,'Deposit',775000.00,'Succeeded','2026-10-28 10:00:00.000000'),(2,'SETTLE-1',1,1,5,'Transfer',2945000.00,'Succeeded','2026-11-04 00:30:00.000000'),(3,'REF-1',1,1,2,'Refund',775000.00,'Succeeded','2026-11-04 01:00:00.000000'),(4,'DEP-2',2,3,1,'Deposit',1150000.00,'Succeeded','2026-11-02 09:00:00.000000'),(5,'SETTLE-2',2,1,6,'Transfer',4370000.00,'Succeeded','2026-11-08 00:30:00.000000'),(6,'REF-2',2,1,3,'Refund',1150000.00,'Succeeded','2026-11-08 01:00:00.000000'),(7,'DEP-3',3,4,1,'Deposit',1000000.00,'Succeeded','2026-10-31 14:00:00.000000'),(8,'SETTLE-3',3,1,5,'Transfer',3800000.00,'Succeeded','2026-11-06 00:30:00.000000'),(9,'REF-3',3,1,4,'Refund',1000000.00,'Succeeded','2026-11-06 01:00:00.000000'),(10,'DEP-4',4,2,1,'Deposit',825000.00,'Succeeded','2026-11-05 08:30:00.000000'),(11,'SETTLE-4',4,1,6,'Transfer',3135000.00,'Succeeded','2026-11-11 00:30:00.000000'),(12,'REF-4',4,1,2,'Refund',825000.00,'Succeeded','2026-11-11 01:00:00.000000'),(13,'DEP-5',5,3,1,'Deposit',700000.00,'Succeeded','2026-11-07 10:00:00.000000'),(14,'SETTLE-5',5,1,5,'Transfer',2660000.00,'Succeeded','2026-11-13 00:30:00.000000'),(15,'REF-5',5,1,3,'Refund',700000.00,'Succeeded','2026-11-13 01:00:00.000000'),(16,'DEP-6',6,8,1,'Deposit',900000.00,'Succeeded','2026-10-29 09:00:00.000000'),(17,'SETTLE-6',6,1,6,'Transfer',3420000.00,'Succeeded','2026-11-05 00:30:00.000000'),(18,'REF-6',6,1,8,'Refund',900000.00,'Succeeded','2026-11-05 01:00:00.000000'),(19,'DEP-7',7,3,1,'Deposit',900000.00,'Succeeded','2026-11-15 14:00:00.000000'),(20,'DEP-8',8,4,1,'Deposit',1475000.00,'Succeeded','2026-11-14 08:00:00.000000'),(21,'DEP-9',9,2,1,'Deposit',700000.00,'Succeeded','2026-11-17 09:00:00.000000'),(22,'DEP-10',10,4,1,'Deposit',650000.00,'Succeeded','2026-11-18 09:00:00.000000'),(23,'DEP-11',11,3,1,'Deposit',750000.00,'Succeeded','2026-11-18 10:00:00.000000'),(24,'DEP-12',12,4,1,'Deposit',1375000.00,'Succeeded','2026-11-17 15:00:00.000000'),(25,'DEP-13',13,2,1,'Deposit',500000.00,'Succeeded','2026-11-16 10:00:00.000000'),(26,'DEP-14',14,3,1,'Deposit',1250000.00,'Succeeded','2026-11-17 11:00:00.000000'),(27,'DEP-15',15,4,1,'Deposit',800000.00,'Succeeded','2026-11-16 16:00:00.000000'),(28,'DEP-16',16,2,1,'Deposit',1675000.00,'Succeeded','2026-11-15 10:00:00.000000'),(29,'DEP-17',17,3,1,'Deposit',900000.00,'Succeeded','2026-11-17 13:00:00.000000'),(30,'DEP-18',18,4,1,'Deposit',1275000.00,'Succeeded','2026-11-18 11:00:00.000000'),(31,'DEP-19',19,2,1,'Deposit',1550000.00,'Succeeded','2026-11-14 09:00:00.000000'),(32,'REF-19',19,1,2,'Refund',1550000.00,'Succeeded','2026-11-16 10:00:00.000000'),(33,'DEP-21',20,2,1,'Deposit',775000.00,'Succeeded','2026-11-16 08:00:00.000000'),(34,'DEP-22',21,4,1,'Deposit',1150000.00,'Succeeded','2026-11-17 09:00:00.000000'),(35,'DEP-23',22,3,1,'Deposit',1937500.00,'Succeeded','2026-11-16 14:00:00.000000'),(36,'DEP-24',23,2,1,'Deposit',1125000.00,'Succeeded','2026-11-17 10:00:00.000000'),(37,'DEP-25',24,4,1,'Deposit',700000.00,'Succeeded','2026-11-15 11:00:00.000000'),(38,'DEP-26',25,3,1,'Deposit',1837500.00,'Succeeded','2026-11-16 15:00:00.000000'),(39,'DEP-27',26,2,1,'Deposit',700000.00,'Succeeded','2026-11-17 14:00:00.000000'),(40,'DEP-28',27,4,1,'Deposit',900000.00,'Succeeded','2026-11-16 09:00:00.000000'),(41,'DEP-29',28,3,1,'Deposit',1562500.00,'Succeeded','2026-11-18 08:30:00.000000'),(42,'DEP-30',29,2,1,'Deposit',1350000.00,'Succeeded','2026-11-14 10:00:00.000000'),(43,'REF-30',29,1,2,'Refund',1350000.00,'Succeeded','2026-11-15 14:00:00.000000'),(44,'PENALTY-30',29,6,1,'Penalty',432000.00,'Succeeded','2026-11-15 14:00:00.000000');
/*!40000 ALTER TABLE `mock_bank_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `notification_id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `message` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `reference_id` int DEFAULT NULL,
  `action_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  PRIMARY KEY (`notification_id`),
  KEY `IX_notifications_user_id_is_read` (`user_id`,`is_read`),
  CONSTRAINT `FK_notifications_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,'367cb99f-62a9-49fe-bb53-e1cb4c14f54e','Chủ xe đã duyệt yêu cầu!','Chủ xe Trần Thị B đã phê duyệt đơn thuê xe Toyota Vios 2023. Chuyến đi bắt đầu lúc 09:00 ngày mai.','trip',NULL,'/account#trips',0,'2026-11-21 09:39:25.448505'),(2,'367cb99f-62a9-49fe-bb53-e1cb4c14f54e','Đặt xe & Ký quỹ thành công','Đơn thuê xe Hyundai Tucson (#BK-1004) đã được ký quỹ trực tuyến 100% an toàn tại tài khoản bảo chứng AZU Escrow.','trip',NULL,'/account#trips',1,'2026-11-21 07:04:25.448505'),(3,'f18c8154-3883-42b9-b173-014013b7cd2e','Yêu cầu thuê xe mới','Khách thuê Nguyễn Văn A vừa gửi yêu cầu thuê xe Mazda CX-5 (43A-999.88). Hạn phản hồi: 20:00 tối nay.','trip',NULL,'/owner',0,'2026-11-21 09:24:25.448505'),(4,'f18c8154-3883-42b9-b173-014013b7cd2e','Chuyến đi hoàn tất & Quyết toán','Đơn thuê xe Toyota Vios đã hoàn tất nghiệm thu. Doanh thu 1.710.000 đ (sau khi trừ 5% hoa hồng) đã được quyết toán chuyển về tài khoản của bạn.','trip',NULL,'/owner',1,'2026-11-20 10:04:25.448505');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `owner_profiles`
--

DROP TABLE IF EXISTS `owner_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `owner_profiles` (
  `owner_profile_id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `cccd_image_front` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `cccd_image_back` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `cccd_number` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `approval_status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `access_status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `reject_reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `submitted_at` datetime(6) NOT NULL,
  `reviewed_by` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `reviewed_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`owner_profile_id`),
  UNIQUE KEY `IX_owner_profiles_cccd_number` (`cccd_number`),
  UNIQUE KEY `IX_owner_profiles_user_id` (`user_id`),
  KEY `IX_owner_profiles_reviewed_by` (`reviewed_by`),
  CONSTRAINT `FK_owner_profiles_users_reviewed_by` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT,
  CONSTRAINT `FK_owner_profiles_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `owner_profiles`
--

LOCK TABLES `owner_profiles` WRITE;
/*!40000 ALTER TABLE `owner_profiles` DISABLE KEYS */;
INSERT INTO `owner_profiles` VALUES (1,'f18c8154-3883-42b9-b173-014013b7cd2e','seed/cccd-owner1-front.jpg','seed/cccd-owner1-back.jpg','001099000001','Approved','Active',NULL,'2026-09-28 15:52:24.664103','eea6da54-0e36-411e-a412-b3a3f85f94ac','2026-09-29 15:52:24.664103'),(2,'259866f6-f66d-496e-8826-e36699690acb','seed/cccd-owner2-front.jpg','seed/cccd-owner2-back.jpg','001099000002','Approved','Active',NULL,'2026-09-28 15:52:24.664103','eea6da54-0e36-411e-a412-b3a3f85f94ac','2026-09-29 15:52:24.664103'),(3,'90676bac-ce48-469c-982a-295592067f49','seed/cccd-owner3-front.jpg','seed/cccd-owner3-back.jpg','001099000003','Approved','Active',NULL,'2026-09-28 15:52:24.664103','eea6da54-0e36-411e-a412-b3a3f85f94ac','2026-09-29 15:52:24.664103'),(4,'3bb5fa2f-d7e3-4e08-a339-bde28bbb082a','seed/cccd-owner4-front.jpg','seed/cccd-owner4-back.jpg','001099000004','Approved','Active',NULL,'2026-10-26 19:57:23.137063','bfbc3599-9953-4a0f-9ebf-3d9863b49bdf','2026-11-10 16:34:08.023172');
/*!40000 ALTER TABLE `owner_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `payment_id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `deposit_status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `penalty_amount` decimal(12,2) DEFAULT NULL,
  `commission_rate` decimal(5,4) NOT NULL,
  `commission_amount` decimal(12,2) DEFAULT NULL,
  `revenue_recorded_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`payment_id`),
  UNIQUE KEY `IX_payments_booking_id` (`booking_id`),
  CONSTRAINT `FK_payments_bookings_booking_id` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,1,'Refunded',NULL,0.0500,155000.00,'2026-11-04 01:00:00.000000'),(2,2,'Refunded',NULL,0.0500,230000.00,'2026-11-08 01:00:00.000000'),(3,3,'Refunded',NULL,0.0500,200000.00,'2026-11-06 01:00:00.000000'),(4,4,'Refunded',NULL,0.0500,165000.00,'2026-11-11 01:00:00.000000'),(5,5,'Refunded',NULL,0.0500,140000.00,'2026-11-13 01:00:00.000000'),(6,6,'Refunded',NULL,0.0500,180000.00,'2026-11-05 01:00:00.000000'),(7,7,'Holding',NULL,0.0500,NULL,NULL),(8,8,'Held',NULL,0.0500,NULL,NULL),(9,9,'Held',NULL,0.0500,NULL,NULL),(10,10,'Held',NULL,0.0500,NULL,NULL),(11,11,'Held',NULL,0.0500,NULL,NULL),(12,12,'Held',NULL,0.0500,NULL,NULL),(13,13,'Held',NULL,0.0500,NULL,NULL),(14,14,'Held',NULL,0.0500,NULL,NULL),(15,15,'Held',NULL,0.0500,NULL,NULL),(16,16,'Held',NULL,0.0500,NULL,NULL),(17,17,'Held',NULL,0.0500,NULL,NULL),(18,18,'Held',NULL,0.0500,NULL,NULL),(19,19,'Refunded',NULL,0.0500,NULL,NULL),(20,21,'Held',NULL,0.0500,NULL,NULL),(21,22,'Held',NULL,0.0500,NULL,NULL),(22,23,'Held',NULL,0.0500,NULL,NULL),(23,24,'Held',NULL,0.0500,NULL,NULL),(24,25,'Held',NULL,0.0500,NULL,NULL),(25,26,'Held',NULL,0.0500,NULL,NULL),(26,27,'Held',NULL,0.0500,NULL,NULL),(27,28,'Held',NULL,0.0500,NULL,NULL),(28,29,'Held',NULL,0.0500,NULL,NULL),(29,30,'Refunded',432000.00,0.0000,0.00,NULL),(30,32,'Refunded',NULL,0.0500,200000.00,'2026-11-18 09:07:33.554459');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `review_id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `reviewer_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `reviewee_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `rating` int NOT NULL,
  `comment` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `is_public` tinyint(1) NOT NULL,
  `is_reported` tinyint(1) NOT NULL DEFAULT '0',
  `moderated_at` datetime(6) DEFAULT NULL,
  `moderated_by_user_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `moderation_notes` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `report_reason` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `reported_at` datetime(6) DEFAULT NULL,
  `reported_by_user_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`review_id`),
  UNIQUE KEY `IX_reviews_booking_id_reviewer_id` (`booking_id`,`reviewer_id`),
  KEY `IX_reviews_reviewee_id` (`reviewee_id`),
  KEY `IX_reviews_reviewer_id` (`reviewer_id`),
  CONSTRAINT `FK_reviews_bookings_booking_id` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE RESTRICT,
  CONSTRAINT `FK_reviews_users_reviewee_id` FOREIGN KEY (`reviewee_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT,
  CONSTRAINT `FK_reviews_users_reviewer_id` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,1,'367cb99f-62a9-49fe-bb53-e1cb4c14f54e','f18c8154-3883-42b9-b173-014013b7cd2e',5,'Xe chất lượng rất tốt, chủ xe nhiệt tình và chu đáo. 10/10!','2026-11-04 02:00:00.000000',1,0,NULL,NULL,NULL,NULL,NULL,NULL),(2,1,'f18c8154-3883-42b9-b173-014013b7cd2e','367cb99f-62a9-49fe-bb53-e1cb4c14f54e',5,'Khách thuê lịch sự, giữ gìn xe sạch sẽ và giao trả xe đúng hẹn.','2026-11-04 03:00:00.000000',1,0,NULL,NULL,NULL,NULL,NULL,NULL),(3,2,'03b257a9-4b0f-48de-9361-e2a20e9dd9a9','259866f6-f66d-496e-8826-e36699690acb',5,'Xe lái rất đầm chắc, âm thanh nghe hay, chủ xe chu đáo chuẩn bị khăn ướt.','2026-11-08 02:00:00.000000',0,0,NULL,NULL,NULL,NULL,NULL,NULL),(4,3,'c789fb44-c4c0-4443-9d79-f8aec591c207','f18c8154-3883-42b9-b173-014013b7cd2e',5,'Xe chất lượng rất tốt, chủ xe nhiệt tình và chu đáo. 10/10!','2026-11-06 02:00:00.000000',1,0,NULL,NULL,NULL,NULL,NULL,NULL),(5,3,'f18c8154-3883-42b9-b173-014013b7cd2e','c789fb44-c4c0-4443-9d79-f8aec591c207',5,'Khách thuê lịch sự, giữ gìn xe sạch sẽ và giao trả xe đúng hẹn.','2026-11-06 03:00:00.000000',1,0,NULL,NULL,NULL,NULL,NULL,NULL),(6,4,'367cb99f-62a9-49fe-bb53-e1cb4c14f54e','259866f6-f66d-496e-8826-e36699690acb',5,'Xe chất lượng rất tốt, chủ xe nhiệt tình và chu đáo. 10/10!','2026-11-11 02:00:00.000000',1,0,NULL,NULL,NULL,NULL,NULL,NULL),(7,4,'259866f6-f66d-496e-8826-e36699690acb','367cb99f-62a9-49fe-bb53-e1cb4c14f54e',5,'Khách thuê lịch sự, giữ gìn xe sạch sẽ và giao trả xe đúng hẹn.','2026-11-11 03:00:00.000000',1,0,NULL,NULL,NULL,NULL,NULL,NULL),(8,6,'97367a6b-0e5f-46c2-8b6e-e6bdd9dd68e6','259866f6-f66d-496e-8826-e36699690acb',5,'Xe chất lượng rất tốt, chủ xe nhiệt tình và chu đáo. 10/10!','2026-11-05 02:00:00.000000',1,0,NULL,NULL,NULL,NULL,NULL,NULL),(9,6,'259866f6-f66d-496e-8826-e36699690acb','97367a6b-0e5f-46c2-8b6e-e6bdd9dd68e6',5,'Khách thuê lịch sự, giữ gìn xe sạch sẽ và giao trả xe đúng hẹn.','2026-11-05 03:00:00.000000',1,0,NULL,NULL,NULL,NULL,NULL,NULL),(10,32,'97367a6b-0e5f-46c2-8b6e-e6bdd9dd68e6','f18c8154-3883-42b9-b173-014013b7cd2e',5,'Xe chạy rất êm, máy lạnh mát sâu, chủ xe nhiệt tình và giao xe đúng giờ. Sẽ tiếp tục ủng hộ!','2026-11-18 09:07:33.702823',1,0,NULL,NULL,NULL,NULL,NULL,NULL),(11,32,'f18c8154-3883-42b9-b173-014013b7cd2e','97367a6b-0e5f-46c2-8b6e-e6bdd9dd68e6',1,'Dịch vụ rất tốt!','2026-11-18 09:20:35.023010',1,0,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `role_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `role_name` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `normalized_name` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `concurrency_stamp` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `IX_roles_role_name` (`role_name`),
  UNIQUE KEY `RoleNameIndex` (`normalized_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES ('3ceabf7e-a3a6-4317-a19c-c77f716e9a7c','Renter','RENTER','d69dddb6-907e-44f1-b014-46c5f3778aa2'),('a5a9ddde-e8ba-4433-a78e-08b269516482','Admin','ADMIN','39017184-457e-4fd8-aa0a-8758e296a5a6'),('bb78d707-dd17-4c23-b839-ce7c16279b3b','Owner','OWNER','17328bf6-ec47-433e-b8cc-efe098f93591'),('e9620492-dfb3-4474-a0cc-bbcbf34ec9fc','Staff','STAFF','249d50d3-4679-4204-b179-dd0718562d1a');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_settings`
--

DROP TABLE IF EXISTS `system_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_settings` (
  `setting_key` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `setting_value` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `updated_by` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`setting_key`),
  KEY `IX_system_settings_updated_by` (`updated_by`),
  CONSTRAINT `FK_system_settings_users_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_settings`
--

LOCK TABLES `system_settings` WRITE;
/*!40000 ALTER TABLE `system_settings` DISABLE KEYS */;
INSERT INTO `system_settings` VALUES ('commission_rate','0.05','bfbc3599-9953-4a0f-9ebf-3d9863b49bdf','2026-11-18 08:00:51.627410'),('deposit_rate','0.25','bfbc3599-9953-4a0f-9ebf-3d9863b49bdf','2026-11-18 08:00:51.627410'),('owner_cancel_penalty_rate','0.08','bfbc3599-9953-4a0f-9ebf-3d9863b49bdf','2026-11-18 08:00:51.627410'),('response_deadline_hours','24','bfbc3599-9953-4a0f-9ebf-3d9863b49bdf','2026-11-18 08:00:51.627410');
/*!40000 ALTER TABLE `system_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_claims`
--

DROP TABLE IF EXISTS `user_claims`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_claims` (
  `claim_id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `claim_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `claim_value` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`claim_id`),
  KEY `IX_user_claims_user_id` (`user_id`),
  CONSTRAINT `FK_user_claims_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_claims`
--

LOCK TABLES `user_claims` WRITE;
/*!40000 ALTER TABLE `user_claims` DISABLE KEYS */;
INSERT INTO `user_claims` VALUES (1,'bfbc3599-9953-4a0f-9ebf-3d9863b49bdf','CanManageSystemConfig','true'),(2,'bfbc3599-9953-4a0f-9ebf-3d9863b49bdf','CanManageAdminAccounts','true'),(3,'a35d4fcb-67aa-475c-8bc2-5d4fd0c584d4','CanManageSystemConfig','true'),(4,'a35d4fcb-67aa-475c-8bc2-5d4fd0c584d4','CanManageAdminAccounts','true'),(5,'367cb99f-62a9-49fe-bb53-e1cb4c14f54e','DriverLicenseVerified','true'),(6,'03b257a9-4b0f-48de-9361-e2a20e9dd9a9','DriverLicenseVerified','true'),(7,'f18c8154-3883-42b9-b173-014013b7cd2e','DriverLicenseVerified','true'),(8,'259866f6-f66d-496e-8826-e36699690acb','DriverLicenseVerified','true'),(9,'90676bac-ce48-469c-982a-295592067f49','DriverLicenseVerified','true'),(10,'3bb5fa2f-d7e3-4e08-a339-bde28bbb082a','DriverLicenseVerified','true'),(14,'c789fb44-c4c0-4443-9d79-f8aec591c207','DriverLicenseVerified','true'),(16,'97367a6b-0e5f-46c2-8b6e-e6bdd9dd68e6','DriverLicenseVerified','true');
/*!40000 ALTER TABLE `user_claims` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `user_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `role_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `IX_user_roles_role_id` (`role_id`),
  CONSTRAINT `FK_user_roles_roles_role_id` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE CASCADE,
  CONSTRAINT `FK_user_roles_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES ('03b257a9-4b0f-48de-9361-e2a20e9dd9a9','3ceabf7e-a3a6-4317-a19c-c77f716e9a7c'),('259866f6-f66d-496e-8826-e36699690acb','3ceabf7e-a3a6-4317-a19c-c77f716e9a7c'),('367cb99f-62a9-49fe-bb53-e1cb4c14f54e','3ceabf7e-a3a6-4317-a19c-c77f716e9a7c'),('3bb5fa2f-d7e3-4e08-a339-bde28bbb082a','3ceabf7e-a3a6-4317-a19c-c77f716e9a7c'),('90676bac-ce48-469c-982a-295592067f49','3ceabf7e-a3a6-4317-a19c-c77f716e9a7c'),('97367a6b-0e5f-46c2-8b6e-e6bdd9dd68e6','3ceabf7e-a3a6-4317-a19c-c77f716e9a7c'),('c789fb44-c4c0-4443-9d79-f8aec591c207','3ceabf7e-a3a6-4317-a19c-c77f716e9a7c'),('f18c8154-3883-42b9-b173-014013b7cd2e','3ceabf7e-a3a6-4317-a19c-c77f716e9a7c'),('a35d4fcb-67aa-475c-8bc2-5d4fd0c584d4','a5a9ddde-e8ba-4433-a78e-08b269516482'),('bfbc3599-9953-4a0f-9ebf-3d9863b49bdf','a5a9ddde-e8ba-4433-a78e-08b269516482'),('eea6da54-0e36-411e-a412-b3a3f85f94ac','a5a9ddde-e8ba-4433-a78e-08b269516482'),('259866f6-f66d-496e-8826-e36699690acb','bb78d707-dd17-4c23-b839-ce7c16279b3b'),('3bb5fa2f-d7e3-4e08-a339-bde28bbb082a','bb78d707-dd17-4c23-b839-ce7c16279b3b'),('90676bac-ce48-469c-982a-295592067f49','bb78d707-dd17-4c23-b839-ce7c16279b3b'),('f18c8154-3883-42b9-b173-014013b7cd2e','bb78d707-dd17-4c23-b839-ce7c16279b3b'),('88ab9a70-f0ea-4807-aaea-8822ba4966fd','e9620492-dfb3-4474-a0cc-bbcbf34ec9fc'),('eea6da54-0e36-411e-a412-b3a3f85f94ac','e9620492-dfb3-4474-a0cc-bbcbf34ec9fc');
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `full_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `gender` tinyint(1) NOT NULL,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `normalized_user_name` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `normalized_email` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `email_confirmed` tinyint(1) NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `security_stamp` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `concurrency_stamp` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `phone_number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `phone_number_confirmed` tinyint(1) NOT NULL,
  `two_factor_enabled` tinyint(1) NOT NULL,
  `lockout_end` datetime(6) DEFAULT NULL,
  `lockout_enabled` tinyint(1) NOT NULL,
  `access_failed_count` int NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `IX_users_email` (`email`),
  UNIQUE KEY `IX_users_phone_number` (`phone_number`),
  UNIQUE KEY `IX_users_username` (`username`),
  UNIQUE KEY `UserNameIndex` (`normalized_user_name`),
  KEY `EmailIndex` (`normalized_email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('03b257a9-4b0f-48de-9361-e2a20e9dd9a9','Trần Thị Bình',1,'renter2','RENTER2','renter2@carrental.test','RENTER2@CARRENTAL.TEST',1,'AQAAAAIAAYagAAAAEMjU9dxUqkEJn9wSjnV94D/aPtgXb1ElJXxl0gaGK/KRR27N2SIStpd8OA9DwS+gxA==','BJCKE4J2MEGFK6ZSIEQQOUKBIN3BP4RY','ff8cbdec-3433-4ade-bbc8-a018dac2c3bb','0900000002',0,0,NULL,1,0),('259866f6-f66d-496e-8826-e36699690acb','Hoàng Thị Em',1,'owner2','OWNER2','owner2@carrental.test','OWNER2@CARRENTAL.TEST',1,'AQAAAAIAAYagAAAAEDddQY1nND4AQwRXr+CEVXrM3MxEQkVo16hRyQ+f5SNJhmyyoHFmRbVJslLBS1ul7g==','2PO4TWDESXTLHJXBZYOLCS5XUUIUBOP3','e0be2b67-fa50-44c9-bb31-95d42cf45d6c','0900000005',0,0,NULL,1,0),('367cb99f-62a9-49fe-bb53-e1cb4c14f54e','Nguyễn Văn An',0,'renter1','RENTER1','renter1@carrental.test','RENTER1@CARRENTAL.TEST',1,'AQAAAAIAAYagAAAAEHledSSv/sR2hz2Rf01eRhqRb2UraTjH6CxHjGGHuJXOLpkArl7mSB01D2WkgSD5JA==','3AOKNFM4EBMTEAUFSCLWZVKRRFWWPXUX','3dced3cb-b4df-4523-82ba-9e03cdc335a0','0900000001',0,0,NULL,1,0),('3bb5fa2f-d7e3-4e08-a339-bde28bbb082a','Lê Hoàng Duy',0,'owner4','OWNER4','owner4@carrental.test','OWNER4@CARRENTAL.TEST',1,'AQAAAAIAAYagAAAAEG6h0sZ/EOu+fJKph5cn/DOTsl4Oofwgm7tQ2F35wZxYdJmg5H4ofJVRj1lP253GRQ==','SWWSZFP7AFOHI4MFNRRXN7G5ZFSYXB7P','597ad0af-8b6f-4223-a518-46b4cd86f73d','0900000012',0,0,NULL,1,0),('88ab9a70-f0ea-4807-aaea-8822ba4966fd','Bùi Văn Khoa',0,'staff2','STAFF2','staff2@carrental.test','STAFF2@CARRENTAL.TEST',1,'AQAAAAIAAYagAAAAEEmWE4XGPfy1f+9nGqTTMIF6heFTnGmpFDGDku0zDATtrBu7AByvODYMEobD8YU3ew==','JK4EISFPC5LP636PCBCCRA5575WHKUO3','91d9aa71-8f65-45b4-9f65-763192e04d17','0900000008',0,0,NULL,1,0),('90676bac-ce48-469c-982a-295592067f49','Võ Văn Phúc',0,'owner3','OWNER3','owner3@carrental.test','OWNER3@CARRENTAL.TEST',1,'AQAAAAIAAYagAAAAEMpoVDNFz3FAFI7SrQ7BS5xhbuvLIL6t202TMI2B5QttSJ9QJrKdQeixTfXjgkbzSw==','VDI2L4GQSNQQF4AKTI36YTK47IVKGXCX','0b965b22-ef3e-47a8-a418-8d9990f51b1b','0900000006',0,0,NULL,1,0),('97367a6b-0e5f-46c2-8b6e-e6bdd9dd68e6','Đỗ Thị Mai',1,'renter4','RENTER4','renter4@carrental.test','RENTER4@CARRENTAL.TEST',1,'AQAAAAIAAYagAAAAEOkN9D0Z7ylEfLx6VSwKfPN0GRkx3AmoloWsna4uh7JGe4WYGALfZboPKO9/0Sv/Uw==','6EP5NUI3HNC54PP6HDSKX4XK7JO6DT32','28e5e63a-24ce-4c72-bde2-47aa58723118','0900000011',0,0,NULL,1,0),('a35d4fcb-67aa-475c-8bc2-5d4fd0c584d4','Quản trị Hai',1,'admin2','ADMIN2','admin2@carrental.test','ADMIN2@CARRENTAL.TEST',1,'AQAAAAIAAYagAAAAEJ9RXFZfQC443ohmb2NBEaUe99feNEJl82v9AL21ijwWyr5soZ1HbOEdggjJsrH4bA==','6OWIAG7XFX56QQ6QCKYTPFLCNUEUZZRO','d2a3d90c-6813-47cd-aae8-b1a0c200f527','0900000010',0,0,NULL,1,0),('bfbc3599-9953-4a0f-9ebf-3d9863b49bdf','Quản trị Một',0,'admin1','ADMIN1','admin1@carrental.test','ADMIN1@CARRENTAL.TEST',1,'AQAAAAIAAYagAAAAEHHwYwhvneK72tTTAQ9P2imuU0xmO4+A9/AwTyffRVp78JChtFYSPnBRhzsPmTSMIQ==','YTNE6BE5T4E2IEVROQROSU344JJCMI35','b6cf5fed-9bfe-46c0-84d5-ca6faf47bc06','0900000009',0,0,NULL,1,0),('c789fb44-c4c0-4443-9d79-f8aec591c207','Lê Minh Cường',0,'renter3','RENTER3','renter3@carrental.test','RENTER3@CARRENTAL.TEST',1,'AQAAAAIAAYagAAAAEByqQUfwrPDs75dg6OsJxEisW+EPEvoQQPGoHgZNSrULYwzCzp8eGRMhm99r9vaj4A==','WAR7OBRAFXOFO3FSJCSYF2ONJU57ZIXC','f5cc55dc-64a4-427b-9557-6528b9241375','0900000003',0,0,NULL,1,0),('eea6da54-0e36-411e-a412-b3a3f85f94ac','Đặng Thu Hà',1,'staff1','STAFF1','staff1@carrental.test','STAFF1@CARRENTAL.TEST',1,'AQAAAAIAAYagAAAAEC1EbDhGr9lzI6n5eAS9VQaU/NYdNZ58IiLJwn5gT7F6YL13O9GbRolGe76FqkWt+g==','S7OWG6FAYLS65O7KR2FDPMGJOAZ7SVDB','7107c2a7-6b1d-43fa-b034-fc8aa97c6773','0900000007',0,0,NULL,1,0),('f18c8154-3883-42b9-b173-014013b7cd2e','Phạm Quốc Dũng',0,'owner1','OWNER1','owner1@carrental.test','OWNER1@CARRENTAL.TEST',1,'AQAAAAIAAYagAAAAEDARSo4vBU6smzGKYVxnu2Z7ypB9ysjq7OEZJXDQ+ifgENwp1f4bYJ8shx5MSZTVOA==','2R5ZCJPY2OPIG3QSF3SIXRIMH72JCFC6','8e452455-cd23-4f34-9df3-c62e031894a7','0900000004',0,0,NULL,1,0);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehicle_documents`
--

DROP TABLE IF EXISTS `vehicle_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicle_documents` (
  `document_id` int NOT NULL AUTO_INCREMENT,
  `vehicle_id` int NOT NULL,
  `registration_cert_image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `insurance_image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `insurance_expiry_date` date NOT NULL,
  `inspection_cert_image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `inspection_expiry_date` date NOT NULL,
  PRIMARY KEY (`document_id`),
  UNIQUE KEY `IX_vehicle_documents_vehicle_id` (`vehicle_id`),
  CONSTRAINT `FK_vehicle_documents_vehicles_vehicle_id` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`vehicle_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicle_documents`
--

LOCK TABLES `vehicle_documents` WRITE;
/*!40000 ALTER TABLE `vehicle_documents` DISABLE KEYS */;
INSERT INTO `vehicle_documents` VALUES (1,1,'seed/reg1.jpg','seed/ins1.jpg','2027-10-28','seed/insp1.jpg','2027-10-28'),(2,2,'seed/reg2.jpg','seed/ins2.jpg','2027-10-28','seed/insp2.jpg','2027-10-28'),(3,3,'seed/reg3.jpg','seed/ins3.jpg','2027-10-28','seed/insp3.jpg','2027-10-28'),(4,4,'seed/reg4.jpg','seed/ins4.jpg','2027-10-28','seed/insp4.jpg','2027-10-28'),(5,5,'seed/reg5.jpg','seed/ins5.jpg','2027-10-28','seed/insp5.jpg','2027-10-28'),(6,6,'seed/reg6.jpg','seed/ins6.jpg','2027-10-28','seed/insp6.jpg','2027-10-28'),(7,7,'seed/reg7.jpg','seed/ins7.jpg','2027-10-28','seed/insp7.jpg','2027-10-28'),(8,8,'seed/reg8.jpg','seed/ins8.jpg','2027-10-28','seed/insp8.jpg','2027-10-28'),(9,9,'seed/reg9.jpg','seed/ins9.jpg','2027-10-28','seed/insp9.jpg','2027-10-28'),(10,10,'seed/reg10.jpg','seed/ins10.jpg','2027-10-28','seed/insp10.jpg','2027-10-28'),(11,11,'seed/reg11.jpg','seed/ins11.jpg','2027-10-28','seed/insp11.jpg','2027-10-28'),(12,12,'seed/reg12.jpg','seed/ins12.jpg','2027-10-28','seed/insp12.jpg','2027-10-28'),(13,13,'seed/reg13.jpg','seed/ins13.jpg','2027-10-28','seed/insp13.jpg','2027-10-28'),(14,14,'seed/reg14.jpg','seed/ins14.jpg','2027-10-28','seed/insp14.jpg','2027-10-28'),(15,15,'seed/reg15.jpg','seed/ins15.jpg','2027-10-28','seed/insp15.jpg','2027-10-28'),(16,16,'seed/reg16.jpg','seed/ins16.jpg','2027-10-28','seed/insp16.jpg','2027-10-28'),(17,18,'/seed/reg17.jpg','/seed/ins17.jpg','2027-11-11','/seed/insp17.jpg','2027-11-11'),(18,19,'/seed/reg18.jpg','/seed/ins18.jpg','2027-11-11','/seed/insp18.jpg','2027-11-11'),(19,20,'/seed/reg19.jpg','/seed/ins19.jpg','2027-11-11','/seed/insp19.jpg','2027-11-11');
/*!40000 ALTER TABLE `vehicle_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehicle_listings`
--

DROP TABLE IF EXISTS `vehicle_listings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicle_listings` (
  `listing_id` int NOT NULL AUTO_INCREMENT,
  `vehicle_id` int NOT NULL,
  `price_per_day` decimal(12,2) NOT NULL,
  `location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `city` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `district` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `latitude` decimal(9,6) DEFAULT NULL,
  `longitude` decimal(9,6) DEFAULT NULL,
  `description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `moderation_status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `moderated_by` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `moderated_at` datetime(6) DEFAULT NULL,
  `moderation_note` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`listing_id`),
  KEY `IX_vehicle_listings_moderated_by` (`moderated_by`),
  KEY `IX_vehicle_listings_vehicle_id` (`vehicle_id`),
  CONSTRAINT `FK_vehicle_listings_users_moderated_by` FOREIGN KEY (`moderated_by`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT,
  CONSTRAINT `FK_vehicle_listings_vehicles_vehicle_id` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`vehicle_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicle_listings`
--

LOCK TABLES `vehicle_listings` WRITE;
/*!40000 ALTER TABLE `vehicle_listings` DISABLE KEYS */;
INSERT INTO `vehicle_listings` VALUES (1,1,700000.00,'Cầu Giấy, Hà Nội','Hà Nội','Cầu Giấy',21.033300,105.794400,'Toyota Vios (dữ liệu thử)','Public','2026-10-28 15:52:24.870167','eea6da54-0e36-411e-a412-b3a3f85f94ac','2026-10-28 15:52:24.869250',NULL),(2,2,600000.00,'Ba Đình, Hà Nội','Hà Nội','Ba Đình',21.034100,105.823900,'Hyundai Accent (dữ liệu thử)','Public','2026-10-28 15:52:24.973303','eea6da54-0e36-411e-a412-b3a3f85f94ac','2026-10-28 15:52:24.869250',NULL),(3,3,1100000.00,'Hai Bà Trưng, Hà Nội','Hà Nội','Hai Bà Trưng',21.006900,105.852400,'Mazda CX-5 (dữ liệu thử)','Public','2026-10-28 15:52:24.973674','eea6da54-0e36-411e-a412-b3a3f85f94ac','2026-10-28 15:52:24.869250',NULL),(4,4,1300000.00,'Nam Từ Liêm, Hà Nội','Hà Nội','Nam Từ Liêm',21.017500,105.784000,'VinFast VF 8 (dữ liệu thử)','Public','2026-10-28 15:52:24.973845','eea6da54-0e36-411e-a412-b3a3f85f94ac','2026-10-28 15:52:24.869250',NULL),(5,5,1500000.00,'Long Biên, Hà Nội','Hà Nội','Long Biên',21.036200,105.892000,'Ford Transit (dữ liệu thử)','Public','2026-10-28 15:52:24.973991','eea6da54-0e36-411e-a412-b3a3f85f94ac','2026-10-28 15:52:24.869250',NULL),(6,6,450000.00,'Đống Đa, Hà Nội','Hà Nội','Đống Đa',21.018000,105.827000,'Kia Morning (dữ liệu thử)','Hidden','2026-10-28 15:52:24.974126','eea6da54-0e36-411e-a412-b3a3f85f94ac','2026-10-28 15:52:24.869250',NULL),(7,7,950000.00,'Hải Châu, TP. Đà Nẵng','TP. Đà Nẵng','Hải Châu',16.054400,108.202200,'Toyota Corolla Cross đời 2023, xe gia đình giữ gìn sạch sẽ, bảo dưỡng định kỳ.','Public','2026-10-28 19:57:23.702422','eea6da54-0e36-411e-a412-b3a3f85f94ac','2026-10-28 19:57:23.453744',NULL),(8,8,850000.00,'Liên Chiểu, TP. Đà Nẵng','TP. Đà Nẵng','Liên Chiểu',16.071200,108.151800,'Mitsubishi Xpander đời 2023, xe gia đình giữ gìn sạch sẽ, bảo dưỡng định kỳ.','Public','2026-10-28 19:57:23.742345','eea6da54-0e36-411e-a412-b3a3f85f94ac','2026-10-28 19:57:23.453744',NULL),(9,9,750000.00,'Sơn Trà, TP. Đà Nẵng','TP. Đà Nẵng','Sơn Trà',16.060100,108.239400,'VinFast VF e34 đời 2023, xe gia đình giữ gìn sạch sẽ, bảo dưỡng định kỳ.','Public','2026-10-28 19:57:23.744699','eea6da54-0e36-411e-a412-b3a3f85f94ac','2026-10-28 19:57:23.453744',NULL),(10,10,650000.00,'Thanh Khê, TP. Đà Nẵng','TP. Đà Nẵng','Thanh Khê',16.062000,108.183000,'Honda City đời 2022, xe gia đình giữ gìn sạch sẽ, bảo dưỡng định kỳ.','Public','2026-10-28 19:57:23.762148','eea6da54-0e36-411e-a412-b3a3f85f94ac','2026-10-28 19:57:23.453744',NULL),(11,11,1400000.00,'Cẩm Lệ, TP. Đà Nẵng','TP. Đà Nẵng','Cẩm Lệ',16.018000,108.216000,'Hyundai Santa Fe đời 2023, xe gia đình giữ gìn sạch sẽ, bảo dưỡng định kỳ.','Public','2026-10-28 19:57:23.764255','eea6da54-0e36-411e-a412-b3a3f85f94ac','2026-10-28 19:57:23.453744',NULL),(12,12,1600000.00,'Ngũ Hành Sơn, TP. Đà Nẵng','TP. Đà Nẵng','Ngũ Hành Sơn',16.029000,108.252000,'Kia Carnival đời 2024, xe gia đình giữ gìn sạch sẽ, bảo dưỡng định kỳ.','Public','2026-10-28 19:57:23.766165','eea6da54-0e36-411e-a412-b3a3f85f94ac','2026-10-28 19:57:23.453744',NULL),(13,13,650000.00,'Quận 1, TP. Hồ Chí Minh','TP. Hồ Chí Minh','Quận 1',10.776900,106.700900,'Toyota Vios đời 2023, xe gia đình giữ gìn sạch sẽ, bảo dưỡng định kỳ.','Public','2026-10-28 19:57:23.768041','eea6da54-0e36-411e-a412-b3a3f85f94ac','2026-10-28 19:57:23.453744',NULL),(14,14,850000.00,'Bình Thạnh, TP. Hồ Chí Minh','TP. Hồ Chí Minh','Bình Thạnh',10.803100,106.694400,'Mazda CX-30 đời 2023, xe gia đình giữ gìn sạch sẽ, bảo dưỡng định kỳ.','Public','2026-10-28 19:57:23.770150','eea6da54-0e36-411e-a412-b3a3f85f94ac','2026-10-28 19:57:23.453744',NULL),(15,15,1200000.00,'Quận 7, TP. Hồ Chí Minh','TP. Hồ Chí Minh','Quận 7',10.732700,106.718800,'Honda CR-V đời 2023, xe gia đình giữ gìn sạch sẽ, bảo dưỡng định kỳ.','Public','2026-10-28 19:57:23.772070','eea6da54-0e36-411e-a412-b3a3f85f94ac','2026-10-28 19:57:23.453744',NULL),(16,16,550000.00,'Hải Châu, TP. Đà Nẵng','TP. Đà Nẵng','Hải Châu',16.060000,108.210000,'VinFast VF 5 Plus đời 2024, xe gia đình giữ gìn sạch sẽ, bảo dưỡng định kỳ.','Public','2026-10-28 19:57:23.774323','bfbc3599-9953-4a0f-9ebf-3d9863b49bdf','2026-11-10 16:32:11.229524','Đã kiểm tra hợp lệ hồ sơ giấy tờ.'),(17,17,900000.00,'Hải Châu, TP. Đà Nẵng','TP. Đà Nẵng','Hải Châu',NULL,NULL,'Mazda CX-5 chinh chu','Public','2026-11-04 07:56:33.001255','bfbc3599-9953-4a0f-9ebf-3d9863b49bdf','2026-11-10 16:32:01.625335','Đã kiểm tra hợp lệ hồ sơ giấy tờ.'),(18,18,1000000.00,'Cầu Giấy, Hà Nội','Hà Nội','Cầu Giấy',21.033300,105.794400,'Hyundai Tucson đời 2024, xe gia đình giữ gìn sạch sẽ, bảo dưỡng định kỳ.','PendingApproval','2026-11-11 06:57:05.364780',NULL,NULL,NULL),(19,19,1500000.00,'Quận 2, TP. Hồ Chí Minh','TP. Hồ Chí Minh','Quận 2',10.785000,106.745000,'Ford Everest đời 2024, xe gia đình giữ gìn sạch sẽ, bảo dưỡng định kỳ.','PendingApproval','2026-11-11 06:57:05.467775',NULL,NULL,NULL),(20,20,1300000.00,'Sơn Trà, TP. Đà Nẵng','TP. Đà Nẵng','Sơn Trà',16.060100,108.239400,'Mazda CX-8 đời 2024, xe gia đình giữ gìn sạch sẽ, bảo dưỡng định kỳ.','Public','2026-11-11 06:57:05.470856','eea6da54-0e36-411e-a412-b3a3f85f94ac','2026-11-11 06:57:05.027929',NULL);
/*!40000 ALTER TABLE `vehicle_listings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehicle_unavailability`
--

DROP TABLE IF EXISTS `vehicle_unavailability`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicle_unavailability` (
  `unavailability_id` int NOT NULL AUTO_INCREMENT,
  `vehicle_id` int NOT NULL,
  `start_date` datetime(6) NOT NULL,
  `end_date` datetime(6) NOT NULL,
  `reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`unavailability_id`),
  KEY `IX_vehicle_unavailability_vehicle_id` (`vehicle_id`),
  CONSTRAINT `FK_vehicle_unavailability_vehicles_vehicle_id` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`vehicle_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicle_unavailability`
--

LOCK TABLES `vehicle_unavailability` WRITE;
/*!40000 ALTER TABLE `vehicle_unavailability` DISABLE KEYS */;
INSERT INTO `vehicle_unavailability` VALUES (3,1,'2026-11-26 00:00:00.000000','2026-11-28 00:00:00.000000','Bảo dưỡng định kỳ 40.000km và thay dầu máy'),(4,3,'2026-11-24 00:00:00.000000','2026-11-27 00:00:00.000000','Chủ xe đi công tác ngoại tỉnh'),(5,5,'2026-11-30 00:00:00.000000','2026-12-04 00:00:00.000000','Đăng kiểm và bảo trì hệ thống lái');
/*!40000 ALTER TABLE `vehicle_unavailability` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehicles`
--

DROP TABLE IF EXISTS `vehicles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicles` (
  `vehicle_id` int NOT NULL AUTO_INCREMENT,
  `owner_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `license_plate` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `brand` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `model` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `year` int NOT NULL,
  `seats` int NOT NULL,
  `transmission` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `fuel_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`vehicle_id`),
  UNIQUE KEY `IX_vehicles_license_plate` (`license_plate`),
  KEY `IX_vehicles_owner_id` (`owner_id`),
  CONSTRAINT `FK_vehicles_users_owner_id` FOREIGN KEY (`owner_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicles`
--

LOCK TABLES `vehicles` WRITE;
/*!40000 ALTER TABLE `vehicles` DISABLE KEYS */;
INSERT INTO `vehicles` VALUES (1,'f18c8154-3883-42b9-b173-014013b7cd2e','30A-123.45','Toyota','Vios',2022,5,'Automatic','Gasoline','Approved'),(2,'f18c8154-3883-42b9-b173-014013b7cd2e','30E-234.56','Hyundai','Accent',2021,5,'Manual','Gasoline','Approved'),(3,'259866f6-f66d-496e-8826-e36699690acb','30F-345.67','Mazda','CX-5',2023,5,'Automatic','Gasoline','Approved'),(4,'259866f6-f66d-496e-8826-e36699690acb','30G-456.78','VinFast','VF 8',2023,5,'Automatic','Electric','Approved'),(5,'90676bac-ce48-469c-982a-295592067f49','29A-567.89','Ford','Transit',2020,16,'Manual','Diesel','Approved'),(6,'90676bac-ce48-469c-982a-295592067f49','29B-678.90','Kia','Morning',2019,4,'Manual','Gasoline','Approved'),(7,'f18c8154-3883-42b9-b173-014013b7cd2e','43A-111.22','Toyota','Corolla Cross',2023,5,'Automatic','Gasoline','Approved'),(8,'f18c8154-3883-42b9-b173-014013b7cd2e','43A-222.33','Mitsubishi','Xpander',2023,7,'Automatic','Gasoline','Approved'),(9,'259866f6-f66d-496e-8826-e36699690acb','43B-333.44','VinFast','VF e34',2023,5,'Automatic','Electric','Approved'),(10,'259866f6-f66d-496e-8826-e36699690acb','43C-444.55','Honda','City',2022,5,'Automatic','Gasoline','Approved'),(11,'90676bac-ce48-469c-982a-295592067f49','43D-555.66','Hyundai','Santa Fe',2023,7,'Automatic','Diesel','Approved'),(12,'90676bac-ce48-469c-982a-295592067f49','43E-666.77','Kia','Carnival',2024,7,'Automatic','Diesel','Approved'),(13,'f18c8154-3883-42b9-b173-014013b7cd2e','51F-777.88','Toyota','Vios',2023,5,'Automatic','Gasoline','Approved'),(14,'259866f6-f66d-496e-8826-e36699690acb','51G-888.99','Mazda','CX-30',2023,5,'Automatic','Gasoline','Approved'),(15,'90676bac-ce48-469c-982a-295592067f49','51H-999.00','Honda','CR-V',2023,7,'Automatic','Gasoline','Approved'),(16,'3bb5fa2f-d7e3-4e08-a339-bde28bbb082a','43A-999.88','VinFast','VF 5 Plus',2024,5,'Automatic','Electric','Approved'),(17,'f18c8154-3883-42b9-b173-014013b7cd2e','43A-888.99','Mazda','CX-5 Premium',2024,5,'Automatic','Gasoline','Approved'),(18,'f18c8154-3883-42b9-b173-014013b7cd2e','30H-999.11','Hyundai','Tucson',2024,5,'Automatic','Gasoline','PendingApproval'),(19,'259866f6-f66d-496e-8826-e36699690acb','51K-888.22','Ford','Everest',2024,7,'Automatic','Diesel','PendingApproval'),(20,'90676bac-ce48-469c-982a-295592067f49','43F-777.33','Mazda','CX-8',2024,7,'Automatic','Gasoline','Approved');
/*!40000 ALTER TABLE `vehicles` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-21 17:07:58
