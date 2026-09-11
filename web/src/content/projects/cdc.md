---
name: Change data capture pipeline
status: in progress
summary: Streams PostgreSQL changes from the write-ahead log into Amazon MSK with Debezium on MSK Connect. An S3 gateway endpoint supplies the connector plugin without a NAT gateway.
stack: [RDS PostgreSQL, Amazon MSK, Debezium, Terraform]
image: /assets/img/cdc-architecture.png
imageAlt: "CDC pipeline architecture: RDS PostgreSQL write-ahead log streamed by Debezium on MSK Connect into Amazon MSK topics"
repo: https://github.com/arkhiVd/cdc-infra
order: 3
featuredOrder: 3
kicker: event streaming · 2026
lede: Terraform infrastructure that turns PostgreSQL row changes into Kafka events with Debezium on MSK Connect—without application polling or a NAT gateway.
---
