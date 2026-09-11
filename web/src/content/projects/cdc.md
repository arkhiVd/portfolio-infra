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

<section class="block wrap">
  <p class="label">problem</p>
  <h2>Publish database changes without changing application code</h2>
    <p>Polling adds delay and repeated database work. This pipeline reads PostgreSQL's write-ahead log instead, producing one event for each insert, update or delete while normal SQL remains unchanged.</p>
    <p>The infrastructure also needed to be reproducible and cost-conscious, with the connector plugin available privately and no fixed NAT gateway charge.</p>
  </section>
  <section class="block wrap">
  <p class="label">architecture</p>
  <h2>RDS WAL to Debezium to Amazon MSK</h2>
    <figure class="arch" data-project-figure="0">
<figcaption>RDS PostgreSQL exposes logical replication; Debezium on MSK Connect reads the WAL and publishes table events to Amazon MSK. S3 stores the custom connector plugin and CloudWatch receives worker logs.</figcaption></figure>
    <p>A dedicated VPC spans two availability zones. One self-referencing security group allows RDS, MSK and MSK Connect to communicate, while an S3 gateway endpoint lets Connect retrieve the plugin without internet egress.</p>
  </section>
  <section class="block wrap">
  <p class="label">decisions and tradeoffs</p>
  <h2>Key design decisions</h2>
    <dl class="rows">
      <div class="row"><dt>Log-based CDC instead of polling</dt><dd>WAL events preserve operation type and before/after values with lower source-database overhead. The tradeoff is managing replication slots and WAL retention.</dd></div>
      <div class="row"><dt>MSK Connect instead of a self-managed worker</dt><dd>A managed connector removes host maintenance, but gives less runtime control and requires AWS-specific plugin packaging.</dd></div>
      <div class="row"><dt>S3 gateway endpoint instead of NAT</dt><dd>The connector retrieves its custom plugin privately without the hourly NAT cost. This path only solves S3 access, not arbitrary outbound traffic.</dd></div>
      <div class="row"><dt>Connector-created topics</dt><dd>Broker auto-creation stays disabled; explicit connector settings create captured-table topics with the intended partitions and replication factor.</dd></div>
    </dl>
  </section>
  <section class="block wrap">
  <p class="label">what broke</p>
  <h2>Logical replication is not enabled by default</h2>
    <p>Debezium cannot create a replication slot against a standard RDS PostgreSQL configuration. A custom parameter group sets <code>rds.logical_replication = 1</code>, and the instance must reboot before the setting takes effect.</p>
    <p>The plugin also cannot be uploaded as the downloaded tarball. The apply step fetches Debezium, repacks its JARs into the flat ZIP expected by MSK Connect, uploads it to S3 and registers that object as a custom plugin.</p>
  </section>
  <section class="block wrap">
  <p class="label">scope</p>
  <h2>What the pipeline provisions</h2>
    <ul class="metrics"><li><b>2</b><span>availability zones and MSK brokers</span></li><li><b>1</b><span>logical replication stream</span></li><li><b>0</b><span>application polling loops</span></li><li><b>0</b><span>NAT gateways</span></li></ul>
  </section>
