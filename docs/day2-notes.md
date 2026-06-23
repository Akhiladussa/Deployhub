\# Day 2 — VPC Build Notes



\## What I built

\- VPC: deployhub-vpc (10.0.0.0/16)

\- 4 subnets: 2 public, 2 private, across 2 AZs

\- Internet Gateway, NAT Gateway

\- 2 route tables (public → IGW, private → NAT)

\- 3 security groups (bastion, database, lambda)

\- Bastion EC2 in public subnet



\## Key things I learned

\- Public subnet traffic → goes straight to Internet Gateway → internet 

Private subnet traffic → goes to NAT Gateway → NAT exits through Internet Gateway → internet 

Inbound traffic from internet → can reach public subnets 

Inbound traffic from internet → cannot reach private subnets  (NAT is one-way) 



