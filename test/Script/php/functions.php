<?php
function get_alexa_popularity($url){    
global $alexa_backlink, $alexa_reach; 
    $alexaxml = "http://xml.alexa.com/data?cli=10&dat=nsa&url=".$url; 
    $xml_parser = xml_parser_create(); 
    $data = get($alexaxml); 
    xml_parse_into_struct($xml_parser, $data, $vals, $index); 
    xml_parser_free($xml_parser); 
    $index_popularity = $index['POPULARITY'][0]; 
    $index_reach = $index['REACH'][0]; 
    $index_linksin = $index['LINKSIN'][0];
    $alexarank = $vals[$index_popularity]['attributes']['TEXT']; 
    $alexa_backlink = $vals[$index_linksin]['attributes']['NUM']; 
    $alexa_reach = $vals[$index_reach]['attributes']['RANK']; 
    return $alexarank; 
} 

function extractint($string){
    $res = '';
    for($i = 0;$i < strlen($string);$i++){
        if(ctype_digit($string[$i])){
            $res .= $string[$i];
        }
    }
    return (int)$res;
}
function get($url){
	$ch = curl_init($url);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
	curl_setopt($ch,CURLOPT_RETURNTRANSFER,1);
	curl_setopt($ch,CURLOPT_USERAGENT,'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13');
	$data = curl_exec($ch);
        return $data;
        
}
function clean_url($url){
	return str_replace(array('http://','https://','www.'),'',$url);
}

function getHeaders($URL) {
 $ch = curl_init();
 curl_setopt($ch, CURLOPT_URL, $URL);
 curl_setopt($ch, CURLOPT_HEADER, true);
 curl_setopt($ch, CURLOPT_NOBODY,1);
 curl_setopt($ch, CURLOPT_RETURNTRANSFER,1);
 curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
 curl_setopt($ch,CURLOPT_USERAGENT,'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13');
 return curl_exec($ch);
}

function httpcodextractor($headers){
$headers = explode("\r\n",$headers);
$http_code = explode(' ',$headers[0]);
return (int)trim($http_code[1]);
}




function stopwordscheck($string){
$stopwords = array("able",
"about",
"above",
"abroad",
"according",
"accordingly",
"across",
"actually",
"adj",
"after",
"afterwards",
"again",
"against",
"ago",
"ahead",
"ain't",
"all",
"allow",
"allows",
"almost",
"alone",
"along",
"alongside",
"already",
"also",
"although",
"always",
"am",
"amid",
"amidst",
"among",
"amongst",
"an",
"and",
"another",
"any",
"anybody",
"anyhow",
"anyone",
"anything",
"anyway",
"anyways",
"anywhere",
"apart",
"appear",
"appreciate",
"appropriate",
"are",
"aren't",
"around",
"as",
"a's",
"aside",
"ask",
"asking",
"associated",
"at",
"available",
"away",
"awfully",
"back",
"backward",
"backwards",
"be",
"became",
"because",
"become",
"becomes",
"becoming",
"been",
"before",
"beforehand",
"begin",
"behind",
"being",
"believe",
"below",
"beside",
"besides",
"best",
"better",
"between",
"beyond",
"both",
"brief",
"but",
"by",
"came",
"can",
"cannot",
"cant",
"can't",
"caption",
"cause",
"causes",
"certain",
"certainly",
"changes",
"clearly",
"c'mon",
"co",
"co.",
"com",
"come",
"comes",
"concerning",
"consequently",
"consider",
"considering",
"contain",
"containing",
"contains",
"corresponding",
"could",
"couldn't",
"course",
"c's",
"currently",
"dare",
"daren't",
"definitely",
"described",
"despite",
"did",
"didn't",
"different",
"directly",
"do",
"does",
"doesn't",
"doing",
"done",
"don't",
"down",
"downwards",
"during",
"each",
"edu",
"eg",
"eight",
"eighty",
"either",
"else",
"elsewhere",
"end",
"ending",
"enough",
"entirely",
"especially",
"et",
"etc",
"even",
"ever",
"evermore",
"every",
"everybody",
"everyone",
"everything",
"everywhere",
"ex",
"exactly",
"example",
"except",
"fairly",
"far",
"farther",
"few",
"fewer",
"fifth",
"first",
"five",
"followed",
"following",
"follows",
"for",
"forever",
"former",
"formerly",
"forth",
"forward",
"found",
"four",
"from",
"further",
"furthermore",
"get",
"gets",
"getting",
"given",
"gives",
"go",
"goes",
"going",
"gone",
"got",
"gotten",
"greetings",
"had",
"hadn't",
"half",
"happens",
"hardly",
"has",
"hasn't",
"have",
"haven't",
"having",
"he",
"he'd",
"he'll",
"hello",
"help",
"",
"hence",
"her",
"here",
"hereafter",
"hereby",
"herein",
"here's",
"hereupon",
"hers",
"herself",
"he's",
"hi",
"him",
"himself",
"his",
"hither",
"hopefully",
"how",
"howbeit",
"however",
"hundred",
"i'd",
"ie",
"if",
"ignored",
"i'll",
"i'm",
"immediate",
"in",
"inasmuch",
"inc",
"inc.",
"indeed",
"indicate",
"indicated",
"indicates",
"inner",
"inside",
"insofar",
"instead",
"into",
"inward",
"is",
"isn't",
"it",
"it'd",
"it'll",
"its",
"it's",
"itself",
"i've",
"just",
"keep",
"keeps",
"kept",
"know",
"known",
"knows",
"last",
"lately",
"later",
"latter",
"latterly",
"least",
"less",
"lest",
"let",
"let's",
"like",
"liked",
"likely",
"likewise",
"little",
"look",
"looking",
"looks",
"low",
"lower",
"ltd",
"made",
"mainly",
"make",
"makes",
"many",
"may",
"maybe",
"mayn't",
"me",
"mean",
"meantime",
"meanwhile",
"merely",
"might",
"mightn't",
"mine",
"minus",
"miss",
"more",
"moreover",
"most",
"mostly",
"mr",
"mrs",
"much",
"must",
"mustn't",
"my",
"myself",
"name",
"namely",
"nd",
"near",
"nearly",
"necessary",
"need",
"needn't",
"needs",
"neither",
"never",
"neverf",
"neverless",
"nevertheless",
"new",
"next",
"nine",
"ninety",
"no",
"nobody",
"non",
"none",
"nonetheless",
"noone",
"no-one",
"nor",
"normally",
"not",
"nothing",
"notwithstanding",
"novel",
"now",
"nowhere",
"obviously",
"of",
"off",
"often",
"oh",
"ok",
"okay",
"old",
"on",
"once",
"one",
"ones",
"one's",
"only",
"onto",
"opposite",
"or",
"other",
"others",
"otherwise",
"ought",
"oughtn't",
"our",
"ours",
"ourselves",
"out",
"outside",
"over",
"overall",
"own",
"particular",
"particularly",
"past",
"per",
"perhaps",
"placed",
"please",
"plus",
"possible",
"presumably",
"probably",
"provided",
"provides",
"que",
"quite",
"qv",
"rather",
"rd",
"re",
"really",
"reasonably",
"recent",
"recently",
"regarding",
"regardless",
"regards",
"relatively",
"respectively",
"right",
"round",
"said",
"same",
"saw",
"say",
"saying",
"says",
"second",
"secondly",
"",
"see",
"seeing",
"seem",
"seemed",
"seeming",
"seems",
"seen",
"self",
"selves",
"sensible",
"sent",
"serious",
"seriously",
"seven",
"several",
"shall",
"shan't",
"she",
"she'd",
"she'll",
"she's",
"should",
"shouldn't",
"since",
"six",
"so",
"some",
"somebody",
"someday",
"somehow",
"someone",
"something",
"sometime",
"sometimes",
"somewhat",
"somewhere",
"soon",
"sorry",
"specified",
"specify",
"specifying",
"still",
"sub",
"such",
"sup",
"sure",
"take",
"taken",
"taking",
"tell",
"tends",
"th",
"than",
"thank",
"thanks",
"thanx",
"that",
"that'll",
"thats",
"that's",
"that've",
"the",
"their",
"theirs",
"them",
"themselves",
"then",
"thence",
"there",
"thereafter",
"thereby",
"there'd",
"therefore",
"therein",
"there'll",
"there're",
"theres",
"there's",
"thereupon",
"there've",
"these",
"they",
"they'd",
"they'll",
"they're",
"they've",
"thing",
"things",
"think",
"third",
"thirty",
"this",
"thorough",
"thoroughly",
"those",
"though",
"three",
"through",
"throughout",
"thru",
"thus",
"till",
"to",
"together",
"too",
"took",
"toward",
"towards",
"tried",
"tries",
"truly",
"try",
"trying",
"t's",
"twice",
"two",
"un",
"under",
"underneath",
"undoing",
"unfortunately",
"unless",
"unlike",
"unlikely",
"until",
"unto",
"up",
"upon",
"upwards",
"us",
"use",
"used",
"useful",
"uses",
"using",
"usually",
"value",
"various",
"versus",
"very",
"via",
"viz",
"vs",
"want",
"wants",
"was",
"wasn't",
"way",
"we",
"we'd",
"welcome",
"well",
"we'll",
"went",
"were",
"we're",
"weren't",
"we've",
"what",
"whatever",
"what'll",
"what's",
"what've",
"when",
"whence",
"whenever",
"where",
"whereafter",
"whereas",
"whereby",
"wherein",
"where's",
"whereupon",
"wherever",
"whether",
"which",
"whichever",
"while",
"whilst",
"whither",
"who",
"who'd",
"whoever",
"whole",
"who'll",
"whom",
"whomever",
"who's",
"whose",
"why",
"will",
"willing",
"wish",
"with",
"within",
"without",
"wonder",
"won't",
"would",
"wouldn't",
"yes",
"yet",
"you",
"you'd",
"you'll",
"your",
"you're",
"yours",
"yourself",
"yourselves",
"you've",
"zero");


$matches = array();
foreach($stopwords as $word){
        $string = strtolower($string);
        $word = ' ' . strtolower($word) . ' ';
        if(preg_match('~'.$word.'~',$string)){
            $matches[] = $word;
        }
    }
if(!empty($matches)){
    return $matches;
}
else{
    return null;
}
}

$googlehost='toolbarqueries.google.com';
$googleua='Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.0.6) Gecko/20060728 Firefox/1.5';


function StrToNum($Str, $Check, $Magic) {
    $Int32Unit = 4294967296;  // 2^32

    $length = strlen($Str);
    for ($i = 0; $i < $length; $i++) {
        $Check *= $Magic;  
        if ($Check >= $Int32Unit) {
            $Check = ($Check - $Int32Unit * (int) ($Check / $Int32Unit));
            //if the check less than -2^31
            $Check = ($Check < -2147483648) ? ($Check + $Int32Unit) : $Check;
        }
        $Check += ord($Str{$i});
    }
    return $Check;
}

function HashURL($String) {
    $Check1 = StrToNum($String, 0x1505, 0x21);
    $Check2 = StrToNum($String, 0, 0x1003F);

    $Check1 >>= 2;  
    $Check1 = (($Check1 >> 4) & 0x3FFFFC0 ) | ($Check1 & 0x3F);
    $Check1 = (($Check1 >> 4) & 0x3FFC00 ) | ($Check1 & 0x3FF);
    $Check1 = (($Check1 >> 4) & 0x3C000 ) | ($Check1 & 0x3FFF);
   
    $T1 = (((($Check1 & 0x3C0) << 4) | ($Check1 & 0x3C)) <<2 ) | ($Check2 & 0xF0F );
    $T2 = (((($Check1 & 0xFFFFC000) << 4) | ($Check1 & 0x3C00)) << 0xA) | ($Check2 & 0xF0F0000 );
   
    return ($T1 | $T2);
}

function CheckHash($Hashnum) {
    $CheckByte = 0;
    $Flag = 0;

    $HashStr = sprintf('%u', $Hashnum) ;
    $length = strlen($HashStr);
   
    for ($i = $length - 1;  $i >= 0;  $i --) {
        $Re = $HashStr{$i};
        if (1 === ($Flag % 2)) {              
            $Re += $Re;    
            $Re = (int)($Re / 10) + ($Re % 10);
        }
        $CheckByte += $Re;
        $Flag ++;  
    }

    $CheckByte %= 10;
    if (0 !== $CheckByte) {
        $CheckByte = 10 - $CheckByte;
        if (1 === ($Flag % 2) ) {
            if (1 === ($CheckByte % 2)) {
                $CheckByte += 9;
            }
            $CheckByte >>= 1;
        }
    }

    return '7'.$CheckByte.$HashStr;
}
function getch($url) { return CheckHash(HashURL($url)); }
function getpr($url) {
    global $googlehost,$googleua;
    $ch = getch($url);
    $fp = fsockopen($googlehost, 80, $errno, $errstr, 30);
    if ($fp) {
       $out = "GET /tbr?client=navclient-auto&ch=$ch&features=Rank&q=info:$url HTTP/1.1\r\n";
       $out .= "User-Agent: $googleua\r\n";
       $out .= "Host: $googlehost\r\n";
       $out .= "Connection: Close\r\n\r\n";
       fwrite($fp, $out);
       while (!feof($fp)) {
            $data = fgets($fp, 128);
            //echo $data;
            $pos = strpos($data, "Rank_");
            if($pos === false){} else{
                $pr=substr($data, $pos + 9);
                $pr=trim($pr);
                $pr=str_replace("\n",'',$pr);
                return $pr;
            }
       }
       fclose($fp);
    }
}

function add_site($url,$file){
    if(!is_int(strpos(trim(file_get_contents($file)),clean_url($url)))){
        file_put_contents($file, file_get_contents($file) . $url . "\r\n");
    }
}