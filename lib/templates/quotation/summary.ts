export function summaryTemplate(summary:any[],total:any){

const rows = summary.map((s,i)=>`

<tr>
<td>${i+1}</td>
<td>${s.scope}</td>
<td>${s.amount}</td>
</tr>

`).join("")

return `

<div class="page">

<h2>GRAND SUMMARY</h2>

<table>

<tr>
<th>No</th>
<th>Description</th>
<th>Amount</th>
</tr>

${rows}

<tr>
<td colspan="2"><b>GRAND TOTAL</b></td>
<td><b>${total}</b></td>
</tr>

</table>

</div>

`
}
