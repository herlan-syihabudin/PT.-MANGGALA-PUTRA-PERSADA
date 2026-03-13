import {coverTemplate} from "./cover"
import {summaryTemplate} from "./summary"
import {breakdownTemplate} from "./breakdown"

export function quotationTemplate(data:any){

return `

<html>

<style>

body{
font-family:Arial;
margin:40px;
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

<body>

${coverTemplate(data)}

${summaryTemplate(data.summary,data.total_value)}

${breakdownTemplate(data.items)}

</body>

</html>

`

}
