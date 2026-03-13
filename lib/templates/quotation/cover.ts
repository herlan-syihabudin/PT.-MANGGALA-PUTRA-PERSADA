export function coverTemplate(data:any){

return `
<div class="page">

<h1>QUOTATION</h1>

<table>

<tr>
<td>Customer</td>
<td>${data.customer_name}</td>
</tr>

<tr>
<td>Project</td>
<td>${data.project_name}</td>
</tr>

<tr>
<td>Location</td>
<td>${data.location}</td>
</tr>

<tr>
<td>Quotation No</td>
<td>${data.proposal_id}</td>
</tr>

<tr>
<td>Date</td>
<td>${data.created_at}</td>
</tr>

</table>

<p>
With reference to your enquiry we are pleased to submit our quotation
for the project <b>${data.project_name}</b>.
</p>

</div>
`
}
