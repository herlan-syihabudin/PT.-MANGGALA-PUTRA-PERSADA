export function breakdownTemplate(items:any[]){

const rows = items.map((item,i)=>`

<tr>
<td>${i+1}</td>
<td>${item.item_name}</td>
<td>${item.unit}</td>
<td>${item.qty}</td>
<td>${item.unit_price}</td>
<td>${item.total_price}</td>
</tr>

`).join("")

return `

<div class="page">

<h2>BREAKDOWN</h2>

<table>

<tr>
<th>No</th>
<th>Description</th>
<th>Unit</th>
<th>Qty</th>
<th>Unit Price</th>
<th>Amount</th>
</tr>

${rows}

</table>

</div>

`
}
