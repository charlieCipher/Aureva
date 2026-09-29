import { insuranceIndex } from '../modules/insurance/continuity';
export const nav = [
  ["/app", "Overview", "home"],
  ["/app/vault", "Vault", "vault"],
  ["/app/records", "Records", "file"],
  ["/app/people", "People", "family"],
  ["/app/continuity", "Tasks", "circle"],
  ["/app/access", "Access", "shield"],
  ["/app/security", "Settings", "settings"],
];
export const categories = [
  "All",
  "Financial",
  "Property",
  "Insurance",
  "Legal",
  "Personal",
  "Other",
];
export const sampleRecords = [
 ['residence','Primary Residence','Property',24,2,'4 days ago'],
 ['investments','Investment Portfolio','Financial',36,3,'2 days ago'],
 ['will','Last Will & Testament','Legal',12,2,'1 week ago'],
 ['life-insurance','Life Insurance Policy','Insurance',8,3,'1 week ago'],
 ['retirement','Retirement Account','Financial',12,2,'2 days ago'],
 ['beach-house','Beach House','Property',24,2,'1 week ago'],
 ['umbrella','Umbrella Insurance','Insurance',8,2,'1 week ago'],
 ['trust','Family Trust','Personal',16,3,'2 weeks ago'],
 ['vehicle','Family Vehicle','Other',10,1,'2 weeks ago'],
 ['savings','Savings Account','Financial',8,2,'2 weeks ago'],
 ['pension','Pension Plan','Financial',10,2,'3 weeks ago'],
 ['brokerage','Brokerage Account','Financial',11,2,'3 weeks ago'],
 ['deposits','Fixed Deposits','Financial',12,1,'3 weeks ago'],
 ['land','Land Registration','Property',12,2,'3 weeks ago'],
 ['attorney','Power of Attorney','Legal',8,2,'1 month ago'],
 ['letters','Family Archive','Personal',16,3,'2 weeks ago'],
 ['family-letters','Family Letters','Personal',10,3,'1 month ago'],
 ['heirlooms','Personal Heirlooms','Other',10,2,'3 weeks ago'],
].map(([id,title,category,files,people,updated])=>({id,title,category,files,people,updated,demo:true,status:id==='life-insurance'?'In progress':'Protected'}));
for (const record of sampleRecords.filter(r=>r.category==='Insurance')) {
 const life=record.id==='life-insurance';
 record.insurance_index=insuranceIndex({institution:'Sample insurer',reference:'Fictional reference',professional:life?'Sample advisor':'',instructions:'Locate the policy and contact the insurer.',insurance:{owner_id:'self',insured_ids:['self'],beneficiary_ids:life?['priya','arjun','kiara']:[],trusted_ids:['daniel'],asset_ids:life?[]:['residence','vehicle'],policy_status:'Active',renewal_date:life?'2027-03-28':'',claim_instructions:life?'Locate the policy document and contact the recorded advisor.':''}},record.files);
}
export const samplePeople = [
  ["priya", "Priya Mehta", "Spouse", "Full", "Verified", "Immediate"],
  ["arjun", "Arjun Mehta", "Son", "Selective", "Verified", "Owner approval"],
  [
    "kiara",
    "Kiara Mehta",
    "Daughter",
    "Selective",
    "Pending",
    "Owner approval",
  ],
  ["rajesh", "Rajesh Mehta", "Father", "View only", "Verified", "Emergency"],
  ["sunita", "Sunita Mehta", "Mother", "View only", "Verified", "Emergency"],
  ["neha", "Neha Kapoor", "Advisor", "View only", "Verified", "Owner approval"],
  [
    "daniel",
    "Daniel Shah",
    "Executor",
    "Conditional",
    "Verified",
    "Verified legal trigger",
  ],
].map(
  ([id, display_name, relationship, permission, verification, activation]) => ({
    id,
    display_name,
    relationship,
    permission,
    verification,
    activation,
    demo: true,
  }),
);
export const catIcon = {
  Personal: "user",
  Financial: "bank",
  Property: "home",
  Insurance: "shield",
  Legal: "file",
  Family: "family",
  Other: "archive",
};
