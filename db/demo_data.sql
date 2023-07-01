INSERT INTO companies (company_id, name) 
VALUES (1, 'Fish & Dills');
SELECT setval('companies_company_id_seq', (SELECT MAX(company_id) from companies));

INSERT INTO company_branches (branch_id, branch_name, company_id, branch_key) 
VALUES (1, 'Compassvale One', 1, 'abc123');
SELECT setval('company_branches_branch_id_seq', (SELECT MAX(branch_id) from company_branches));

INSERT INTO groups (group_id, branch_id, group_name, queue_seed, queue_prefix, est_time) 
VALUES 
(1, 1, '1-2 people', 6000, 'A', 6430), 
(2, 1, '3-4 people', 4000, 'P', 7301), 
(3, 1, '5 or more people', 1000, 'T', 33);
SELECT setval('groups_group_id_seq', (SELECT MAX(group_id) from groups));
