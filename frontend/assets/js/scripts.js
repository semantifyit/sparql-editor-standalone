var globalResult='';
    var emptyData={};
    // var hostUrl="http://greizer.sti.uibk.ac.at:7000/";
    // var hostUrl="http://localhost:7000";
    var endpoint = 'api/query'+'?urival=  &';
    var request_counter_endpoint = "/api/counter";
    var request_statement_counter = "/api/statement-counter";
    var show = true;
    var queryString = '';
    const PREFIX = `PREFIX : <http://schema.org/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>`;
    queryCounter = `${PREFIX}
    SELECT (COUNT(*) as ?statment) WHERE{
        ?s ?p ?o .
    }`;
//select change
$("#apiUrl").change(function(){
    let val= $('#apiUrl option:selected').text();
    endpoint= yasqe.options.sparql.endpoint='api/query'+'?urival='+val+'&';
//    console.log('url is',val);
    counteronChnage(val);    
});

    getRequestCounter();

    // const uriVal='';
    // $('#apiUrl').keyup(function(){
    //     console.log('#apiUrl');
    //     uriVal=$(this).val();
    //     endpoint= yasqe.options.sparql.endpoint='api/query'+'?urival='+uriVal+'&';
    //     console.log(yasqe.options.sparql.endpoint);
    //     //localStorage.setItem('uriVal',uriVal);
    // });

    var yasqe = YASQE(document.getElementById('yasgui'), {    
      sparql: {
        showQueryButton: true,
        endpoint: endpoint,
        requestMethod: "GET",
        queryString: YASQE.defaults.value,
        callbacks: {
          success(data) {
            console.log('yasqe data ',data);
            globalResult=data.dataVal
          },
          error: (e) => {
              setError(e)
          }
        }
      }
    });
    var yasr = YASR(document.getElementById("yasr"), {
        //this way, the URLs in the results are prettified using the defined prefixes in the query
        getUsedPrefixes: yasqe.getPrefixesFromQuery
    });
    yasqe.options.sparql.callbacks.complete = () => yasr.setResponse(globalResult);
    $('#query_selector').on('change', function () {
        var nameval = this.value;
        var url = '/api/query' + '/' + nameval;
        $.ajax({
            url: url,
            success: function (data) {
                yasqe.setValue(data);
            },
            error: function (error) {
                console.log('error ' + error)
            }
        });
    });
function setError(error) {
    $('#request_error').show();
    $('#request_error').text(error.responseText);
     $('#request_error').fadeOut(2000);
    setTimeout(() => {
         $('#request_error').text('');
    }, 2000);
}
function updateCounter(data) {
    $('#total_request_counter').text(data.toLocaleString('en-US'));
}
function getRequestCounter() {
    $.ajax({
        url: request_counter_endpoint,
        success: function (data) {
            updateCounter(data)
        },
        error: function (error) {
            console.log('error ' + error)
        }
    });
}
function counteronChnage(val) {
    $.ajax({
        url:'/api/query'+'?urival='+val+'&',
        data:{query:queryCounter},
        success: function (data) {          
            let totalStaments=data.dataVal.results.bindings[0].statment.value;
            updateCounter(totalStaments);
        },
        error: function (error) {
            console.log('error ' + error)
        }
    });
}