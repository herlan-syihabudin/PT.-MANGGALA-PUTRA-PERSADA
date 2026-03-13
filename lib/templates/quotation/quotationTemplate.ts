import { coverTemplate } from "./cover"
import { summaryTemplate } from "./summary"
import { breakdownTemplate } from "./breakdown"

export function quotationTemplate(data: any) {

const summary = data.summary || []
const items = data.items || []
const total = data.total_value || 0

return `

<html>

<head>

<style>

body{
font-family:Arial;
margin:0;
}

.page{
page-break-after:always;
}

table{
width:100%;
border-collapse:collapse;
margin-top:20px;
}

td,th{
border:1px solid #ccc;
padding:6px;
}

</style>

</head>

<body>

${coverTemplate(data)}

${summaryTemplate(summary,total)}

${breakdownTemplate(items)}

</body>

</html>

`
}
