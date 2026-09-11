/* ============================================================
   Aptitude & Reasoning Field Guide — question bank (data only)
   Loaded before drill.js on any page with a .drill. The engine reads
   window.APTI_QUESTIONS (filter by `section` + `topic`) and shows the
   pretty topic label from window.APTI_TOPIC_NAMES.

   Each item: { section, topic, diff, q, options:[4], answer:index, explain }
     section ∈ foundations | quant | reasoning | verbal | di
     topic   = the lesson id it belongs to (e.g. "qa-percent")
     diff    ∈ warm | core | stretch
   q/options/explain may contain inline HTML (fractions, <sup>, etc.).
   Static, copyable, offline — no answers are computed at runtime.
   ============================================================ */
window.APTI_TOPIC_NAMES = {
  "fo-speed": "Speed math",
  "qa-numbers": "Numbers", "qa-percent": "Percentages", "qa-ratio": "Ratio & mixtures",
  "qa-averages": "Averages & ages", "qa-commerce": "Profit/interest", "qa-tsd": "Time-speed-distance",
  "qa-work": "Time & work", "qa-pnc": "P&C / probability", "qa-geometry": "Geometry",
  "lr-series": "Series & analogies", "lr-coding": "Coding–decoding", "lr-blood": "Blood relations",
  "lr-direction": "Direction sense", "lr-deduction": "Syllogisms", "lr-ineq": "Coded inequalities",
  "lr-seating": "Seating & puzzles",
  "lr-spatial": "Clocks/calendars/cubes",
  "va-rc": "Reading comprehension", "va-grammar": "Grammar", "va-completion": "Completion & jumbles", "va-vocab": "Vocabulary",
  "di-charts": "Charts & tables", "di-caselets": "Caselets", "di-ds": "Data sufficiency"
};

window.APTI_QUESTIONS = [
  /* ---------- FOUNDATIONS · speed math ---------- */
  { section:"foundations", topic:"fo-speed", diff:"warm", q:"Quick: 25 &times; 16 = ?", options:["400","350","420","380"], answer:0, explain:"&times;25 is &times;100 &divide; 4. 16 &divide; 4 = 4 &rarr; 400." },
  { section:"foundations", topic:"fo-speed", diff:"core", q:"What is 12.5% of 256?", options:["32","28","36","30"], answer:0, explain:"12.5% = <sup>1</sup>&frasl;<sub>8</sub>. 256 &divide; 8 = 32." },
  { section:"foundations", topic:"fo-speed", diff:"warm", q:"9998 &times; 5 = ?", options:["49990","50000","49980","48990"], answer:0, explain:"&times;5 is &times;10 &divide; 2. 99980 &divide; 2 = 49990." },
  { section:"foundations", topic:"fo-speed", diff:"core", q:"Estimate 396 &divide; 4.9 (nearest 10):", options:["80","90","70","100"], answer:0, explain:"&asymp; 400 &divide; 5 = 80. Approximate first, then refine." },
  { section:"foundations", topic:"fo-speed", diff:"stretch", q:"Unit (last) digit of 7<sup>4</sup>?", options:["1","7","9","3"], answer:0, explain:"7 cycles 7,9,3,1 every 4 powers; 7<sup>4</sup> ends in 1." },

  /* ---------- QUANT · numbers ---------- */
  { section:"quant", topic:"qa-numbers", diff:"warm", q:"HCF of 24 and 36?", options:["12","6","4","18"], answer:0, explain:"24 = 2&sup3;&middot;3, 36 = 2&sup2;&middot;3&sup2; &rarr; common = 2&sup2;&middot;3 = 12." },
  { section:"quant", topic:"qa-numbers", diff:"warm", q:"LCM of 4, 6 and 8?", options:["24","48","12","16"], answer:0, explain:"Highest powers: 2&sup3;&middot;3 = 24." },
  { section:"quant", topic:"qa-numbers", diff:"stretch", q:"Remainder when 2<sup>10</sup> is divided by 7?", options:["2","1","4","0"], answer:0, explain:"2&sup3; = 8 &equiv; 1 (mod 7); 2<sup>10</sup> = 2<sup>9</sup>&middot;2 &equiv; 1&middot;2 = 2." },
  { section:"quant", topic:"qa-numbers", diff:"core", q:"A number divisible by both 3 and 4 must be divisible by:", options:["12","7","6","24"], answer:0, explain:"3 and 4 are coprime &rarr; LCM = 12." },
  { section:"quant", topic:"qa-numbers", diff:"core", q:"Largest 3-digit number divisible by 18?", options:["990","999","996","984"], answer:0, explain:"999 &divide; 18 = 55.5 &rarr; 18 &times; 55 = 990." },

  /* ---------- QUANT · percentages ---------- */
  { section:"quant", topic:"qa-percent", diff:"warm", q:"What is 30% of 250?", options:["75","70","80","65"], answer:0, explain:"10% = 25 &rarr; 30% = 75." },
  { section:"quant", topic:"qa-percent", diff:"core", q:"A price rises 20% then falls 20%. Net change?", options:["&minus;4%","0%","+4%","&minus;2%"], answer:0, explain:"1.2 &times; 0.8 = 0.96 &rarr; a 4% net fall." },
  { section:"quant", topic:"qa-percent", diff:"warm", q:"45 is what percent of 180?", options:["25%","20%","30%","35%"], answer:0, explain:"45 &divide; 180 = <sup>1</sup>&frasl;<sub>4</sub> = 25%." },
  { section:"quant", topic:"qa-percent", diff:"core", q:"If 15% of x = 90, then x = ?", options:["600","450","750","540"], answer:0, explain:"x = 90 &divide; 0.15 = 600." },
  { section:"quant", topic:"qa-percent", diff:"core", q:"Salary rises from 800 to 920. % increase?", options:["15%","12%","20%","10%"], answer:0, explain:"120 &divide; 800 = 0.15 = 15%." },

  /* ---------- QUANT · ratio / mixtures ---------- */
  { section:"quant", topic:"qa-ratio", diff:"warm", q:"Divide 60 in the ratio 2 : 3.", options:["24 and 36","20 and 40","30 and 30","25 and 35"], answer:0, explain:"5 parts &rarr; 60 &divide; 5 = 12; 2&times;12 and 3&times;12 = 24 and 36." },
  { section:"quant", topic:"qa-ratio", diff:"stretch", q:"If a : b = 2 : 3 and b : c = 4 : 5, then a : c = ?", options:["8 : 15","2 : 5","6 : 5","8 : 5"], answer:0, explain:"Make b common: a:b = 8:12, b:c = 12:15 &rarr; a:c = 8:15." },
  { section:"quant", topic:"qa-ratio", diff:"core", q:"Mix 2 L of 20% solution with 3 L of 45%. Resulting strength?", options:["35%","30%","40%","32%"], answer:0, explain:"(0.4 + 1.35) &divide; 5 = 1.75 &divide; 5 = 35%." },
  { section:"quant", topic:"qa-ratio", diff:"stretch", q:"Alligation: blend &#8377;12/kg and &#8377;18/kg to get &#8377;16/kg. Ratio (cheaper : dearer)?", options:["1 : 2","2 : 1","1 : 3","3 : 1"], answer:0, explain:"Distances (18&minus;16):(16&minus;12) = 2:4 = 1:2." },
  { section:"quant", topic:"qa-ratio", diff:"warm", q:"Two numbers are in ratio 3 : 4 and sum to 56. The larger is?", options:["32","24","28","30"], answer:0, explain:"7 parts = 56 &rarr; 1 part = 8 &rarr; 4&times;8 = 32." },

  /* ---------- QUANT · averages / ages ---------- */
  { section:"quant", topic:"qa-averages", diff:"warm", q:"Average of the first 5 natural numbers?", options:["3","2.5","3.5","4"], answer:0, explain:"(1+2+3+4+5) &divide; 5 = 15 &divide; 5 = 3." },
  { section:"quant", topic:"qa-averages", diff:"core", q:"Average of 4 numbers is 15; three are 10, 20, 12. The fourth?", options:["18","16","20","22"], answer:0, explain:"Total 60; 60 &minus; 42 = 18." },
  { section:"quant", topic:"qa-averages", diff:"stretch", q:"Father is 40, son 10. In how many years will father be twice the son?", options:["20","15","25","30"], answer:0, explain:"40+x = 2(10+x) &rarr; x = 20." },
  { section:"quant", topic:"qa-averages", diff:"core", q:"Average of 30 numbers is 20; add 5 to each. New average?", options:["25","20","35","30"], answer:0, explain:"Adding a constant to every term adds it to the mean." },
  { section:"quant", topic:"qa-averages", diff:"core", q:"5 years ago the average age of a 4-person family was 24. Today (same members)?", options:["29","24","28","30"], answer:0, explain:"Each gained 5 years &rarr; mean +5 = 29." },

  /* ---------- QUANT · profit / interest ---------- */
  { section:"quant", topic:"qa-commerce", diff:"warm", q:"Cost &#8377;500, sold for &#8377;600. Profit %?", options:["20%","16.7%","25%","10%"], answer:0, explain:"Profit 100 &divide; cost 500 = 20%." },
  { section:"quant", topic:"qa-commerce", diff:"warm", q:"20% discount on a marked price of &#8377;250. You pay?", options:["&#8377;200","&#8377;220","&#8377;210","&#8377;190"], answer:0, explain:"250 &times; 0.8 = 200." },
  { section:"quant", topic:"qa-commerce", diff:"core", q:"Simple interest on &#8377;1000 at 10% for 2 years?", options:["&#8377;200","&#8377;100","&#8377;210","&#8377;220"], answer:0, explain:"1000 &times; 10 &times; 2 &divide; 100 = 200." },
  { section:"quant", topic:"qa-commerce", diff:"stretch", q:"Compound interest on &#8377;1000 at 10% for 2 years?", options:["&#8377;210","&#8377;200","&#8377;220","&#8377;221"], answer:0, explain:"1000 &times; 1.1&sup2; = 1210 &rarr; interest = 210." },
  { section:"quant", topic:"qa-commerce", diff:"core", q:"An item sold at &#8377;90 gives a 10% loss. Cost price?", options:["&#8377;100","&#8377;99","&#8377;81","&#8377;110"], answer:0, explain:"90 = 0.9 &times; CP &rarr; CP = 100." },

  /* ---------- QUANT · time speed distance ---------- */
  { section:"quant", topic:"qa-tsd", diff:"warm", q:"120 km covered in 2 hours. Speed?", options:["60 km/h","50 km/h","40 km/h","80 km/h"], answer:0, explain:"120 &divide; 2 = 60 km/h." },
  { section:"quant", topic:"qa-tsd", diff:"core", q:"Convert 72 km/h to m/s.", options:["20 m/s","25 m/s","18 m/s","36 m/s"], answer:0, explain:"&times; <sup>5</sup>&frasl;<sub>18</sub>: 72 &times; 5 &divide; 18 = 20." },
  { section:"quant", topic:"qa-tsd", diff:"core", q:"Two trains at 60 and 40 km/h move toward each other. Relative speed?", options:["100 km/h","20 km/h","50 km/h","120 km/h"], answer:0, explain:"Opposite directions add: 60 + 40 = 100." },
  { section:"quant", topic:"qa-tsd", diff:"core", q:"A 100 m train at 20 m/s crosses a pole in?", options:["5 s","10 s","4 s","2 s"], answer:0, explain:"Distance = train length: 100 &divide; 20 = 5 s." },
  { section:"quant", topic:"qa-tsd", diff:"warm", q:"Boat 10 km/h in still water, stream 2 km/h. Downstream speed?", options:["12 km/h","8 km/h","10 km/h","6 km/h"], answer:0, explain:"Downstream = boat + stream = 12 km/h." },

  /* ---------- QUANT · time & work ---------- */
  { section:"quant", topic:"qa-work", diff:"core", q:"A finishes a job in 10 days, B in 15. Working together, fraction per day?", options:["<sup>1</sup>&frasl;<sub>6</sub>","<sup>1</sup>&frasl;<sub>5</sub>","<sup>1</sup>&frasl;<sub>25</sub>","<sup>1</sup>&frasl;<sub>12</sub>"], answer:0, explain:"<sup>1</sup>&frasl;<sub>10</sub> + <sup>1</sup>&frasl;<sub>15</sub> = <sup>5</sup>&frasl;<sub>30</sub> = <sup>1</sup>&frasl;<sub>6</sub>." },
  { section:"quant", topic:"qa-work", diff:"warm", q:"... so together they finish in?", options:["6 days","5 days","8 days","12 days"], answer:0, explain:"Rate <sup>1</sup>&frasl;<sub>6</sub> per day &rarr; 6 days." },
  { section:"quant", topic:"qa-work", diff:"core", q:"12 workers finish in 8 days. How long for 16 workers?", options:["6 days","4 days","10 days","12 days"], answer:0, explain:"Inverse proportion: 12 &times; 8 &divide; 16 = 6." },
  { section:"quant", topic:"qa-work", diff:"stretch", q:"Pipe A fills a tank in 4 h; pipe B empties it in 6 h. Net time to fill?", options:["12 h","2 h","10 h","24 h"], answer:0, explain:"<sup>1</sup>&frasl;<sub>4</sub> &minus; <sup>1</sup>&frasl;<sub>6</sub> = <sup>1</sup>&frasl;<sub>12</sub> &rarr; 12 h." },
  { section:"quant", topic:"qa-work", diff:"core", q:"LCM trick: for 10-day and 15-day workers take total work = 30. A&rsquo;s rate?", options:["3 units/day","2 units/day","5 units/day","6 units/day"], answer:0, explain:"30 &divide; 10 = 3 (B = 2; together 5 &rarr; 6 days)." },

  /* ---------- QUANT · P&C / probability ---------- */
  { section:"quant", topic:"qa-pnc", diff:"warm", q:"How many ways to arrange the letters of CAT?", options:["6","3","9","12"], answer:0, explain:"All distinct &rarr; 3! = 6." },
  { section:"quant", topic:"qa-pnc", diff:"core", q:"Choose 2 from 5 (order doesn&rsquo;t matter):", options:["10","20","5","25"], answer:0, explain:"&#8312;C&#8322; = (5&times;4)/2 = 10." },
  { section:"quant", topic:"qa-pnc", diff:"warm", q:"Arrange 5 distinct books on a shelf:", options:["120","60","24","20"], answer:0, explain:"5! = 120." },
  { section:"quant", topic:"qa-pnc", diff:"warm", q:"Probability of an even number on a fair die?", options:["<sup>1</sup>&frasl;<sub>2</sub>","<sup>1</sup>&frasl;<sub>3</sub>","<sup>2</sup>&frasl;<sub>3</sub>","<sup>1</sup>&frasl;<sub>6</sub>"], answer:0, explain:"3 of 6 faces (2,4,6) are even." },
  { section:"quant", topic:"qa-pnc", diff:"core", q:"Two coins tossed. P(exactly one head)?", options:["<sup>1</sup>&frasl;<sub>2</sub>","<sup>1</sup>&frasl;<sub>4</sub>","<sup>3</sup>&frasl;<sub>4</sub>","<sup>1</sup>&frasl;<sub>3</sub>"], answer:0, explain:"HT or TH = 2 of 4 outcomes." },

  /* ---------- QUANT · geometry ---------- */
  { section:"quant", topic:"qa-geometry", diff:"warm", q:"Area of a rectangle 8 m by 5 m?", options:["40 m&sup2;","26 m&sup2;","13 m&sup2;","80 m&sup2;"], answer:0, explain:"Area = l &times; b = 8 &times; 5 = 40." },
  { section:"quant", topic:"qa-geometry", diff:"warm", q:"Perimeter of a square of side 9?", options:["36","81","18","27"], answer:0, explain:"4 &times; 9 = 36." },
  { section:"quant", topic:"qa-geometry", diff:"core", q:"Right triangle legs 6 and 8. Hypotenuse?", options:["10","14","&radic;100 only","9"], answer:0, explain:"3-4-5 &times;2 &rarr; 6-8-10." },
  { section:"quant", topic:"qa-geometry", diff:"core", q:"Circle diameter 14, &pi; = 22/7. Area?", options:["154","44","88","308"], answer:0, explain:"r = 7; (22/7)&times;49 = 154." },
  { section:"quant", topic:"qa-geometry", diff:"stretch", q:"Wire length 44 bent into a circle (&pi; = 22/7). Radius?", options:["7","14","22","11"], answer:0, explain:"2&pi;r = 44 &rarr; 2&times;(22/7)&times;r = 44 &rarr; r = 7." },

  /* ---------- REASONING · series & analogies ---------- */
  { section:"reasoning", topic:"lr-series", diff:"warm", q:"Next term: 2, 4, 8, 16, ?", options:["32","24","20","30"], answer:0, explain:"Each term doubles." },
  { section:"reasoning", topic:"lr-series", diff:"core", q:"Next term: 3, 6, 11, 18, ?", options:["27","25","29","26"], answer:0, explain:"Differences 3, 5, 7, 9 &rarr; +9 = 27." },
  { section:"reasoning", topic:"lr-series", diff:"core", q:"Odd one out: 4, 9, 16, 20, 25", options:["20","9","16","25"], answer:0, explain:"All are perfect squares except 20." },
  { section:"reasoning", topic:"lr-series", diff:"warm", q:"Letter series: A, C, E, G, ?", options:["I","H","J","F"], answer:0, explain:"Skip one letter each time &rarr; I." },
  { section:"reasoning", topic:"lr-series", diff:"warm", q:"Analogy: Hand : Glove :: Foot : ?", options:["Shoe","Sock","Toe","Leg"], answer:0, explain:"A glove covers a hand as a shoe covers a foot." },

  /* ---------- REASONING · coding-decoding ---------- */
  { section:"reasoning", topic:"lr-coding", diff:"core", q:"If CAT = DBU (each letter +1), then DOG = ?", options:["EPH","CPF","EPG","DPH"], answer:0, explain:"+1 each: D&rarr;E, O&rarr;P, G&rarr;H." },
  { section:"reasoning", topic:"lr-coding", diff:"warm", q:"With A=1, B=2, &hellip;, the sum of letters in BAD is?", options:["7","6","8","9"], answer:0, explain:"2 + 1 + 4 = 7." },
  { section:"reasoning", topic:"lr-coding", diff:"warm", q:"Shift +2: the letter M becomes?", options:["O","N","K","P"], answer:0, explain:"M + 2 = O." },
  { section:"reasoning", topic:"lr-coding", diff:"core", q:"If &lsquo;cat&rsquo; &rarr; &lsquo;tac&rsquo; (reverse), then &lsquo;dog&rsquo; &rarr; ?", options:["god","ogd","dgo","gdo"], answer:0, explain:"Reverse the order: d-o-g &rarr; g-o-d." },
  { section:"reasoning", topic:"lr-coding", diff:"stretch", q:"With A=1&hellip;Z=26, the code for BEAD is:", options:["2 5 1 4","2 4 1 5","1 5 2 4","2 5 4 1"], answer:0, explain:"B=2, E=5, A=1, D=4." },

  /* ---------- REASONING · blood relations ---------- */
  { section:"reasoning", topic:"lr-blood", diff:"core", q:"A woman says of a man: &lsquo;He is my mother&rsquo;s only son.&rsquo; He is her?", options:["Brother","Father","Son","Uncle"], answer:0, explain:"Her mother&rsquo;s only son is her brother." },
  { section:"reasoning", topic:"lr-blood", diff:"warm", q:"A is B&rsquo;s father. B is C&rsquo;s sister. A is C&rsquo;s?", options:["Father","Brother","Uncle","Grandfather"], answer:0, explain:"B and C are siblings, so A is father to both." },
  { section:"reasoning", topic:"lr-blood", diff:"stretch", q:"&lsquo;My grandfather&rsquo;s only daughter&rsquo; is your?", options:["Mother or aunt","Sister","Grandmother","Cousin"], answer:0, explain:"She is your parent&rsquo;s sister or your mother." },
  { section:"reasoning", topic:"lr-blood", diff:"core", q:"P is Q&rsquo;s son. Q is R&rsquo;s wife. R is P&rsquo;s?", options:["Father","Uncle","Brother","Grandfather"], answer:0, explain:"Q is the mother, R (her husband) is P&rsquo;s father." },
  { section:"reasoning", topic:"lr-blood", diff:"core", q:"X is the brother of Y. Y is the sister of Z. X is Z&rsquo;s?", options:["Brother","Sister","Father","Cannot be told"], answer:0, explain:"X is a male sibling of both &rarr; brother (Z&rsquo;s gender is irrelevant)." },

  /* ---------- REASONING · direction sense ---------- */
  { section:"reasoning", topic:"lr-direction", diff:"core", q:"Walk 3 km North then 4 km East. Straight-line distance from start?", options:["5 km","7 km","1 km","6 km"], answer:0, explain:"&radic;(3&sup2;+4&sup2;) = 5 km (Pythagoras)." },
  { section:"reasoning", topic:"lr-direction", diff:"warm", q:"Facing North, you turn right. Now facing?", options:["East","West","South","North"], answer:0, explain:"Right of North is East." },
  { section:"reasoning", topic:"lr-direction", diff:"core", q:"Facing South, you turn left twice (90&deg; each). Now facing?", options:["North","East","West","South"], answer:0, explain:"Two left turns = 180&deg;: South &rarr; North." },
  { section:"reasoning", topic:"lr-direction", diff:"core", q:"At sunrise (sun in the East), your shadow points?", options:["West","East","North","South"], answer:0, explain:"A shadow falls opposite the sun." },
  { section:"reasoning", topic:"lr-direction", diff:"warm", q:"Walk 5 m East, 5 m South, 5 m West. Distance from start?", options:["5 m","0 m","10 m","15 m"], answer:0, explain:"East and West cancel &rarr; net 5 m South." },

  /* ---------- REASONING · syllogisms / statements ---------- */
  { section:"reasoning", topic:"lr-deduction", diff:"warm", q:"All cats are animals. All animals are mortal. Therefore:", options:["All cats are mortal","Some cats are not mortal","No cats are mortal","All mortals are cats"], answer:0, explain:"Transitive chain: cats &sub; animals &sub; mortal." },
  { section:"reasoning", topic:"lr-deduction", diff:"core", q:"Some pens are red. All red things are bright. Valid conclusion?", options:["Some pens are bright","All pens are bright","No pens are bright","All bright things are pens"], answer:0, explain:"The red pens are bright &rarr; some pens are bright." },
  { section:"reasoning", topic:"lr-deduction", diff:"stretch", q:"All A are B. No B are C. Therefore:", options:["No A are C","All C are A","Some A are C","All A are C"], answer:0, explain:"A &sub; B and B &cap; C = &empty; &rarr; A &cap; C = &empty;." },
  { section:"reasoning", topic:"lr-deduction", diff:"warm", q:"Statement: &lsquo;No student failed.&rsquo; What must be true?", options:["Every student passed","Some students failed","Half passed","No one took the test"], answer:0, explain:"If none failed, all passed." },
  { section:"reasoning", topic:"lr-deduction", diff:"stretch", q:"All squares are rectangles. Some rectangles are blue. Can we conclude some squares are blue?", options:["No","Yes","Only if blue","Always"], answer:0, explain:"The blue rectangles needn&rsquo;t be squares &mdash; no valid link." },

  /* ---------- REASONING · coded inequalities ---------- */
  { section:"reasoning", topic:"lr-ineq", diff:"warm", q:"A &ge; B = C. Does A &ge; C follow?", options:["Yes","No","Only if A &gt; B","Only if B &gt; C"], answer:0, explain:"Equality is transparent: A &ge; B and B = C &rarr; A &ge; C." },
  { section:"reasoning", topic:"lr-ineq", diff:"core", q:"P &ge; Q &gt; R. Which is definite?", options:["P &gt; R","P = R possible","Q &lt; R","P &lt; R"], answer:0, explain:"Even if P = Q, Q &gt; R forces P &gt; R." },
  { section:"reasoning", topic:"lr-ineq", diff:"core", q:"A &ge; B &ge; C. Does A &gt; C follow?", options:["No","Yes","Always","Only if B &gt; C"], answer:0, explain:"All equal (A=B=C) satisfies &ge; chains but breaks A &gt; C." },
  { section:"reasoning", topic:"lr-ineq", diff:"warm", q:"A &gt; B &ge; C. Relation of A to C?", options:["A &gt; C","A = C possible","A &lt; C","Cannot say"], answer:0, explain:"Strict &gt; then &ge; still forces A &gt; C." },
  { section:"reasoning", topic:"lr-ineq", diff:"stretch", q:"A &ge; B. Conclusions: (I) A &gt; B (II) A = B. Best choice?", options:["Either I or II","Only I","Only II","Neither"], answer:0, explain:"&ge; means exactly one of &gt; or = holds &mdash; classic either&ndash;or." },

  /* ---------- REASONING · seating & puzzles ---------- */
  { section:"reasoning", topic:"lr-seating", diff:"warm", q:"Five people sit in a row. If A is exactly in the middle, A&rsquo;s position is?", options:["3rd","2nd","4th","1st"], answer:0, explain:"The middle of 5 is the 3rd seat." },
  { section:"reasoning", topic:"lr-seating", diff:"core", q:"Six people sit in a circle (facing centre). Who is opposite seat 1?", options:["Seat 4","Seat 3","Seat 6","Seat 2"], answer:0, explain:"Opposite = + n/2 = 1 + 3 = seat 4." },
  { section:"reasoning", topic:"lr-seating", diff:"warm", q:"A is left of B; B is left of C. Left-to-right order?", options:["A, B, C","C, B, A","B, A, C","A, C, B"], answer:0, explain:"A &lt; B &lt; C from the left." },
  { section:"reasoning", topic:"lr-seating", diff:"core", q:"In a row, P sits 2nd to the right of Q. If Q is 1st, P is?", options:["3rd","2nd","4th","1st"], answer:0, explain:"Q at 1 &rarr; two seats right = position 3." },
  { section:"reasoning", topic:"lr-seating", diff:"core", q:"A 6-floor building: A is on top (6); B is 2 floors below A. B&rsquo;s floor?", options:["4","5","3","2"], answer:0, explain:"6 &minus; 2 = floor 4." },

  /* ---------- REASONING · clocks / calendars / cubes ---------- */
  { section:"reasoning", topic:"lr-spatial", diff:"warm", q:"Angle between clock hands at 3:00?", options:["90&deg;","60&deg;","120&deg;","45&deg;"], answer:0, explain:"Each hour mark = 30&deg;; 3 apart = 90&deg;." },
  { section:"reasoning", topic:"lr-spatial", diff:"core", q:"How far does the minute hand move in 20 minutes?", options:["120&deg;","90&deg;","100&deg;","180&deg;"], answer:0, explain:"6&deg; per minute &times; 20 = 120&deg;." },
  { section:"reasoning", topic:"lr-spatial", diff:"core", q:"If today is Monday, what day falls 15 days later?", options:["Tuesday","Monday","Wednesday","Sunday"], answer:0, explain:"15 mod 7 = 1 odd day &rarr; Monday + 1 = Tuesday." },
  { section:"reasoning", topic:"lr-spatial", diff:"stretch", q:"A cube painted on all faces is cut into 27 equal cubes. How many have exactly 3 painted faces?", options:["8","12","6","1"], answer:0, explain:"Only the 8 corner cubes show 3 faces." },
  { section:"reasoning", topic:"lr-spatial", diff:"warm", q:"On a standard die opposite faces sum to 7. Opposite of 2 is?", options:["5","6","3","4"], answer:0, explain:"7 &minus; 2 = 5." },

  /* ---------- VERBAL · reading comprehension ---------- */
  { section:"verbal", topic:"va-rc", diff:"core", q:"Best strategy for a timed RC passage?", options:["Skim for structure, then answer from the text","Memorise every line","Answer from prior knowledge","Read footnotes first"], answer:0, explain:"Map the passage, then locate evidence &mdash; answers come from the text." },
  { section:"verbal", topic:"va-rc", diff:"warm", q:"An &lsquo;inference&rsquo; question asks you to:", options:["Conclude what is implied","Find a directly stated fact","Define a word","Count paragraphs"], answer:0, explain:"Inference = supported by the text but not stated outright." },
  { section:"verbal", topic:"va-rc", diff:"warm", q:"The &lsquo;tone&rsquo; of a passage refers to:", options:["The author&rsquo;s attitude","The number of facts","The title","The word count"], answer:0, explain:"Tone = the author&rsquo;s attitude toward the subject." },
  { section:"verbal", topic:"va-rc", diff:"core", q:"&lsquo;The author would most likely agree&rsquo; means you should:", options:["Pick the option best supported by the passage","Pick the most extreme option","Use outside knowledge","Pick the longest option"], answer:0, explain:"Stay within the passage; avoid extreme or unsupported claims." },
  { section:"verbal", topic:"va-rc", diff:"stretch", q:"&lsquo;All of the following EXCEPT&rsquo; — pick the option that is:", options:["Not supported by the passage","The longest","The most extreme","Repeated twice"], answer:0, explain:"Three options have evidence; the answer is the unsupported one." },
  { section:"verbal", topic:"va-rc", diff:"stretch", q:"Passage: hybrid &lsquo;may&rsquo; balance focus and mentorship. Valid inference?", options:["Hybrid is a possible balance, not a guarantee","Hybrid always succeeds","Remote work never helps","Managers hate remote work"], answer:0, explain:"&lsquo;May&rsquo; = possible; reject absolutes the text never owns." },
  { section:"verbal", topic:"va-rc", diff:"core", q:"&lsquo;According to the passage&rsquo; usually wants a:", options:["Stated detail","Wild inference","Your opinion","Dictionary definition"], answer:0, explain:"According-to stems point to a line you can underline." },
  { section:"verbal", topic:"va-rc", diff:"stretch", q:"Primary-purpose trap is choosing:", options:["A true detail that isn&rsquo;t why the author wrote","The hedged main claim","Evidence from paragraph 1","The author&rsquo;s tone word"], answer:0, explain:"Purpose &ne; any true fact; ask why the whole piece exists." },

  /* ---------- VERBAL · grammar ---------- */
  { section:"verbal", topic:"va-grammar", diff:"warm", q:"Choose the correct sentence:", options:["She doesn&rsquo;t have any money.","She don&rsquo;t have no money.","She doesn&rsquo;t have no money.","She don&rsquo;t have any money."], answer:0, explain:"&lsquo;She&rsquo; takes &lsquo;doesn&rsquo;t&rsquo;; avoid the double negative." },
  { section:"verbal", topic:"va-grammar", diff:"core", q:"Spot the error: &lsquo;Each of the boys have a book.&rsquo;", options:["have &rarr; has","Each &rarr; Every","boys &rarr; boy","No error"], answer:0, explain:"&lsquo;Each&rsquo; is singular &rarr; &lsquo;has&rsquo;." },
  { section:"verbal", topic:"va-grammar", diff:"warm", q:"&lsquo;He is taller ___ his brother.&rsquo;", options:["than","then","that","from"], answer:0, explain:"Comparisons use &lsquo;than&rsquo;." },
  { section:"verbal", topic:"va-grammar", diff:"core", q:"&lsquo;The team ___ winning.&rsquo; (acting as one unit)", options:["is","are","were","be"], answer:0, explain:"A collective noun as a single unit takes &lsquo;is&rsquo;." },

  /* ---------- VERBAL · completion & jumbles ---------- */
  { section:"verbal", topic:"va-completion", diff:"warm", q:"&lsquo;Despite the rain, they ___ the match.&rsquo;", options:["continued","stopped","cancelled","postponed"], answer:0, explain:"&lsquo;Despite&rsquo; signals contrast &mdash; they kept playing." },
  { section:"verbal", topic:"va-completion", diff:"warm", q:"&lsquo;She is known ___ her honesty.&rsquo;", options:["for","of","with","by"], answer:0, explain:"&lsquo;Known for&rsquo; a quality is the idiom." },
  { section:"verbal", topic:"va-completion", diff:"core", q:"First step in a para-jumble?", options:["Find the opening (independent) sentence","Sort alphabetically","Pick the longest sentence","Start from the last line"], answer:0, explain:"Find the sentence that introduces the topic without referring back." },
  { section:"verbal", topic:"va-completion", diff:"core", q:"Order them: (P) He opened it. (Q) A letter arrived. (R) He smiled.", options:["Q P R","P Q R","R Q P","Q R P"], answer:0, explain:"Arrive &rarr; open &rarr; react." },

  /* ---------- VERBAL · vocabulary ---------- */
  { section:"verbal", topic:"va-vocab", diff:"warm", q:"Synonym of &lsquo;abundant&rsquo;:", options:["plentiful","scarce","tiny","rare"], answer:0, explain:"Abundant = present in large quantity." },
  { section:"verbal", topic:"va-vocab", diff:"core", q:"Antonym of &lsquo;transparent&rsquo;:", options:["opaque","clear","glassy","visible"], answer:0, explain:"Opaque = not see-through." },
  { section:"verbal", topic:"va-vocab", diff:"core", q:"&lsquo;Benevolent&rsquo; most nearly means:", options:["kind","cruel","wealthy","clever"], answer:0, explain:"Benevolent = well-meaning, kind." },
  { section:"verbal", topic:"va-vocab", diff:"warm", q:"One word for &lsquo;a person who eats everything&rsquo;:", options:["omnivore","herbivore","carnivore","gourmet"], answer:0, explain:"Omni- (all) + -vore (eater)." },

  /* ---------- DI · charts & tables ---------- */
  { section:"di", topic:"di-charts", diff:"warm", q:"On a pie chart (360&deg; total), a 25% slice spans?", options:["90&deg;","60&deg;","120&deg;","72&deg;"], answer:0, explain:"25% of 360&deg; = 90&deg;." },
  { section:"di", topic:"di-charts", diff:"warm", q:"Bar values are 40, 60, 80, 20. Average?", options:["50","60","45","40"], answer:0, explain:"200 &divide; 4 = 50." },
  { section:"di", topic:"di-charts", diff:"core", q:"A pie slice is 90&deg; of a total value 8000. The slice&rsquo;s value?", options:["2000","1000","4000","3000"], answer:0, explain:"90/360 = &frac14;; 8000 &divide; 4 = 2000." },
  { section:"di", topic:"di-charts", diff:"core", q:"Two bars look almost equal. Fastest reliable move?", options:["Read the printed values","Guess the taller","Measure with a ruler","Skip the question"], answer:0, explain:"When values are close, read the labels &mdash; don&rsquo;t eyeball." },

  /* ---------- DI · caselets ---------- */
  { section:"di", topic:"di-caselets", diff:"warm", q:"A group of 200 is 60% male. Number of females?", options:["80","120","140","100"], answer:0, explain:"40% of 200 = 80." },
  { section:"di", topic:"di-caselets", diff:"core", q:"Revenue 500, cost 350. Profit margin?", options:["30%","25%","35%","40%"], answer:0, explain:"Profit 150 &divide; 500 = 30%." },
  { section:"di", topic:"di-caselets", diff:"core", q:"Sales grew from 400 (2018) to 500 (2019). % growth?", options:["25%","20%","10%","30%"], answer:0, explain:"100 &divide; 400 = 25%." },
  { section:"di", topic:"di-caselets", diff:"warm", q:"Best first move on a dense caselet?", options:["Extract numbers into a small table","Read every word twice","Answer from memory","Skip all of it"], answer:0, explain:"Turn prose into a table; most questions then need one quick calc." },
  { section:"di", topic:"di-caselets", diff:"stretch", q:"2019 revenue = 500. Pie of 2019: Product A = 40%. A&rsquo;s revenue?", options:["200","40","250","160"], answer:0, explain:"Multi-set: share &times; that year&rsquo;s total = 0.4 &times; 500 = 200." },
  { section:"di", topic:"di-caselets", diff:"stretch", q:"60 like tea, 50 like coffee, 20 like both. How many like at least one?", options:["90","110","70","80"], answer:0, explain:"Union = 60 + 50 &minus; 20 = 90 (don&rsquo;t add 110)." },
  { section:"di", topic:"di-caselets", diff:"core", q:"Bar 2018 = 400, 2019 = 500. Pie (2019) X = 30%. Wrong move?", options:["30% of 400","30% of 500","Read the pie caption","Compute 0.3 &times; 500"], answer:0, explain:"Applying 2019&rsquo;s pie to 2018&rsquo;s total is the classic multi-set trap." },

  /* ---------- DI · data sufficiency ---------- */
  { section:"di", topic:"di-ds", diff:"warm", q:"Data-sufficiency questions ask whether the statements are ___ to answer.", options:["sufficient","interesting","long","true"], answer:0, explain:"DS tests sufficiency, not the final numeric value." },
  { section:"di", topic:"di-ds", diff:"core", q:"Value of integer x? (1) x &gt; 5  (2) x &lt; 7. Using both:", options:["x = 6","x = 5","x = 7","Cannot say"], answer:0, explain:"5 &lt; x &lt; 7 with x an integer &rarr; x = 6 (both needed)." },
  { section:"di", topic:"di-ds", diff:"core", q:"In DS you should:", options:["Stop once you know it&rsquo;s answerable","Always compute the full answer","Pick the biggest number","Always guess A"], answer:0, explain:"Judge sufficiency only &mdash; full computation wastes time." },
  { section:"di", topic:"di-ds", diff:"warm", q:"Is n even?  (1) n = 2k for some integer k. Statement (1) is:", options:["Sufficient","Insufficient","Irrelevant","Contradictory"], answer:0, explain:"n = 2k is the definition of even &rarr; sufficient." },

  /* ---------- STRETCH DENSIFY (OA harder items) ---------- */
  { section:"quant", topic:"qa-percent", diff:"stretch", q:"A price rises 25% then falls 20%. Net change?", options:["0%","+5%","&minus;5%","+2%"], answer:0, explain:"1.25 &times; 0.8 = 1.00 &rarr; break-even (the classic 25-up / 20-down trap)." },
  { section:"quant", topic:"qa-percent", diff:"stretch", q:"x is 20% more than y. y is what % less than x?", options:["16 <sup>2</sup>&frasl;<sub>3</sub>%","20%","25%","80%"], answer:0, explain:"If y=100, x=120. Drop from 120 to 100 is 20/120 = 1/6 = 16 <sup>2</sup>&frasl;<sub>3</sub>%." },

  { section:"quant", topic:"qa-tsd", diff:"stretch", q:"A goes 60 km at 30 km/h and returns at 60 km/h. Average speed for the trip?", options:["40 km/h","45 km/h","50 km/h","90 km/h"], answer:0, explain:"Harmonic mean for equal distances: 2ab/(a+b) = 2&times;30&times;60/90 = 40. (Not the arithmetic mean 45.)" },
  { section:"quant", topic:"qa-tsd", diff:"stretch", q:"Two trains 120 m and 80 m long run toward each other at 20 m/s and 10 m/s. Time to cross?", options:["<sup>20</sup>&frasl;<sub>3</sub> s","10 s","6 s","4 s"], answer:0, explain:"Relative speed 30 m/s; distance = sum of lengths 200 m &rarr; 200/30 = 20/3 s." },

  { section:"quant", topic:"qa-pnc", diff:"stretch", q:"How many distinct 4-letter words from BANK (letters may not repeat)?", options:["24","16","12","4"], answer:0, explain:"4 distinct letters, use all: 4! = 24." },
  { section:"quant", topic:"qa-pnc", diff:"stretch", q:"A bag has 3 red and 2 blue balls. P(2 red in 2 draws without replacement)?", options:["<sup>3</sup>&frasl;<sub>10</sub>","<sup>9</sup>&frasl;<sub>25</sub>","<sup>2</sup>&frasl;<sub>5</sub>","<sup>1</sup>&frasl;<sub>2</sub>"], answer:0, explain:"(3/5)&times;(2/4) = 6/20 = 3/10." },

  { section:"quant", topic:"qa-work", diff:"stretch", q:"A and B together finish in 12 days; A alone in 20. B alone?", options:["30 days","8 days","32 days","15 days"], answer:0, explain:"1/B = 1/12 &minus; 1/20 = (5&minus;3)/60 = 1/30 &rarr; 30 days." },
  { section:"quant", topic:"qa-commerce", diff:"stretch", q:"Marked &#8377;800, two successive 10% discounts. Selling price?", options:["&#8377;648","&#8377;640","&#8377;720","&#8377;700"], answer:0, explain:"0.9 &times; 0.9 &times; 800 = 648 (not a single 20% off)." },
  { section:"quant", topic:"qa-geometry", diff:"stretch", q:"A 7&times;7&times;7 cube is painted and cut into 1&times;1&times;1 cubes. How many have exactly 1 face painted?", options:["150","98","125","343"], answer:0, explain:"Each face contributes (7&minus;2)&sup2; = 25; 6 faces &times; 25 = 150." },
  { section:"quant", topic:"qa-numbers", diff:"stretch", q:"Smallest number that leaves remainder 1 when divided by 2, 3, 4, 5, 6?", options:["61","60","31","121"], answer:0, explain:"LCM(2..6)=60; number = 60k+1. Smallest &gt;1 is 61." },
  { section:"quant", topic:"qa-averages", diff:"stretch", q:"Average of 10 scores is 50. Removing two scores of 40 and 60, new average?", options:["50","48","52","45"], answer:0, explain:"Total was 500; remove 100 &rarr; 400 over 8 = 50 (unchanged)." },
  { section:"quant", topic:"qa-ratio", diff:"stretch", q:"Milk:water = 4:1. After adding 5 L water, ratio becomes 2:1. Original milk?", options:["20 L","16 L","10 L","25 L"], answer:0, explain:"Milk stays 4x; water x+5; 4x:(x+5)=2:1 &rarr; 4x = 2x+10 &rarr; x=5; milk=20." },

  { section:"reasoning", topic:"lr-series", diff:"stretch", q:"Next: 2, 3, 8, 27, 112, ?", options:["565","560","450","336"], answer:0, explain:"&times;1+1, &times;2+2, &times;3+3, &times;4+4, &times;5+5: 112&times;5+5 = 565." },
  { section:"reasoning", topic:"lr-series", diff:"stretch", q:"Odd one: 121, 144, 169, 196, 225, 256, 288", options:["288","225","196","256"], answer:0, explain:"Squares 11&sup2;&hellip;16&sup2;; 288 is not a perfect square." },

  { section:"reasoning", topic:"lr-direction", diff:"stretch", q:"A walks 10 m North, 10 m East, 10 m South, 10 m West. Where relative to start?", options:["At the start","10 m East","10 m North","10 m West"], answer:0, explain:"A closed square path &mdash; back at origin." },
  { section:"reasoning", topic:"lr-direction", diff:"stretch", q:"Facing West, turn left, walk 5 m, turn left, walk 5 m. Facing?", options:["East","West","North","South"], answer:0, explain:"West &rarr; left = South; left again = East." },

  { section:"reasoning", topic:"lr-seating", diff:"stretch", q:"Eight seats in a circle facing centre. If A&rsquo;s right is B, who is to A&rsquo;s immediate left?", options:["Cannot say from this alone","B","Opposite of B","Same as B"], answer:0, explain:"Only A&rsquo;s right is fixed; left neighbour is unnamed." },
  { section:"reasoning", topic:"lr-seating", diff:"stretch", q:"In a row of 7, C is 3rd left of D; D is 2nd right of E. If E is at 3, C is at?", options:["2","1","4","5"], answer:0, explain:"E=3 &rarr; D=5; C is 3 left of D &rarr; position 2." },

  { section:"reasoning", topic:"lr-coding", diff:"stretch", q:"If in a code ROSE is 6821 and CHAIR is 73456, what is SEARCH?", options:["214673","216473","214763","241673"], answer:0, explain:"Map letters: S=2,E=1,A=4,R=6,C=7,H=3 &rarr; 214673." },
  { section:"reasoning", topic:"lr-blood", diff:"stretch", q:"A says of a boy: &lsquo;He is the only son of my father&rsquo;s only son.&rsquo; The boy is A&rsquo;s?", options:["Son","Brother","Uncle","Cousin"], answer:0, explain:"Father&rsquo;s only son = A (male speaker). That person&rsquo;s only son = A&rsquo;s son." },
  { section:"reasoning", topic:"lr-ineq", diff:"stretch", q:"P &gt; Q &ge; R = S &lt; T. Which is false?", options:["P &lt; S","P &gt; R","Q &ge; S","S &lt; T"], answer:0, explain:"P &gt; Q &ge; R = S forces P &gt; S, so P &lt; S is false." },
  { section:"reasoning", topic:"lr-spatial", diff:"stretch", q:"Odd days from 1 Jan to 1 Mar in a non-leap year?", options:["3","2","1","0"], answer:0, explain:"Jan 31 + Feb 28 = 59 days; 59 mod 7 = 3 odd days." },
  { section:"reasoning", topic:"lr-deduction", diff:"stretch", q:"Some doctors are poets. All poets are singers. Which follows?", options:["Some doctors are singers","All doctors are singers","No doctor is a singer","All singers are doctors"], answer:0, explain:"The poet-doctors are singers &rarr; some doctors are singers." },

  { section:"verbal", topic:"va-grammar", diff:"stretch", q:"Spot the error: &lsquo;Neither of the girls have finished.&rsquo;", options:["have &rarr; has","Neither &rarr; None","girls &rarr; girl","No error"], answer:0, explain:"Neither is singular &rarr; has." },
  { section:"verbal", topic:"va-grammar", diff:"stretch", q:"&lsquo;If I ___ you, I would accept.&rsquo;", options:["were","was","am","be"], answer:0, explain:"Unreal conditional: subjunctive &lsquo;were&rsquo;." },

  { section:"verbal", topic:"va-completion", diff:"stretch", q:"&lsquo;The proposal was ___ by the board after a long debate.&rsquo;", options:["ratified","ratify","ratification","rating"], answer:0, explain:"Passive needs past participle: ratified." },
  { section:"verbal", topic:"va-completion", diff:"stretch", q:"Best opener for a para-jumble about a new policy?", options:["A sentence naming the policy with no back-reference","&lsquo;This is why it failed.&rsquo;","&lsquo;Therefore officials acted.&rsquo;","&lsquo;As mentioned above&hellip;&rsquo;"], answer:0, explain:"Openers introduce; pronouns and &lsquo;therefore&rsquo; need prior context." },

  { section:"verbal", topic:"va-vocab", diff:"stretch", q:"Closest meaning of &lsquo;ephemeral&rsquo;:", options:["short-lived","eternal","heavy","loud"], answer:0, explain:"Ephemeral = lasting a very short time." },
  { section:"verbal", topic:"va-vocab", diff:"stretch", q:"Antonym of &lsquo;mitigate&rsquo;:", options:["aggravate","lessen","soften","ease"], answer:0, explain:"Mitigate = make less severe; opposite = aggravate." },

  { section:"di", topic:"di-charts", diff:"stretch", q:"Production: 2018=120, 2019=150, 2020=180. % growth 2018&rarr;2020?", options:["50%","33%","60%","25%"], answer:0, explain:"(180&minus;120)/120 = 50% (use the base year, not year-on-year stack)." },
  { section:"di", topic:"di-charts", diff:"stretch", q:"A table shows exports 40 and imports 50. Trade deficit?", options:["10","90","&minus;10","0"], answer:0, explain:"Deficit = imports &minus; exports = 10." },

  { section:"di", topic:"di-ds", diff:"stretch", q:"What is x + y? (1) x + y = 10 (2) x &minus; y = 2. Sufficiency?", options:["(1) alone","(2) alone","Both needed","Either"], answer:0, explain:"(1) directly gives the sum; (2) alone does not." },
  { section:"di", topic:"di-ds", diff:"stretch", q:"Is integer n &gt; 10? (1) n &gt; 8 (2) n is even. Together?", options:["Not sufficient","Sufficient","(1) alone","(2) alone"], answer:0, explain:"Even n&gt;8 could be 10 (not &gt;10) or 12 &mdash; still ambiguous." },

  { section:"di", topic:"di-caselets", diff:"stretch", q:"Class of 40: 22 take Maths, 18 take Physics, 8 take both. Only Maths?", options:["14","22","8","10"], answer:0, explain:"Only Maths = 22 &minus; 8 = 14." },
  { section:"foundations", topic:"fo-speed", diff:"stretch", q:"Quick: 48 &times; 25 = ?", options:["1200","1000","1250","960"], answer:0, explain:"&times;25 = &times;100 &divide; 4: 4800 &divide; 4 = 1200." },
];
