// Unit 0: goals, Start here and Discuss, and the list of units
CONCEPTS.V1='Components and length';CONCEPTS.V2='Adding vectors';
CONCEPTS.P1='Dot product and angle';CONCEPTS.P2='Projection onto a direction';
CONCEPTS.X1='Cross product';CONCEPTS.X2='Axis and sense of a turn';
CONCEPTS.F1='Field of a point charge';CONCEPTS.F2='Superposition of fields';
CONCEPTS.C1='Complex numbers as arrows';CONCEPTS.C2='Multiplying rotates';

var GOALS0=[
  {id:'g01',group:'V',concepts:['V1','V2'],short:'Work with vectors as arrows',
    text:'Go between the components of a vector and its length and direction, and add or subtract vectors by components and by the tip-to-tail picture.'},
  {id:'g02',group:'P',concepts:['P1','P2'],short:'Project one vector onto another',
    text:'Compute a dot product, read the angle between two vectors from it, and find the projection of one vector onto the direction of another.'},
  {id:'g03',group:'X',concepts:['X1','X2'],short:'Use the cross product and the right-hand rule',
    text:'Find the direction and size of a cross product, and use the right-hand rule to say which way a turn about an axis moves a point.'},
  {id:'g04',group:'F',concepts:['F1','F2'],short:'Add fields',
    text:'Draw the field of a point charge, and find the field of several charges at a point by adding their fields as vectors.'},
  {id:'g05',group:'C',concepts:['C1','C2'],short:'Treat a complex number as an arrow',
    text:'Go between a + bi and r e^(iθ), and predict where multiplication by another complex number sends the arrow.'}
];

var CAX={x:'Re',y:'Im'};
var INTRO0=[
  {id:'why0',title:'What this unit is for',
    html:[
      '<p class="txt">In Unit 1 the state of a qubit is an arrow. A gate turns the arrow, a measurement projects it onto an axis, and a phase is an angle. This unit is about the arrows themselves.</p>',
      '<ul class="plain"><li>Adding vectors, and splitting one into components.</li><li>The dot product, which measures how much of one vector lies along another.</li><li>The cross product, which gives the axis of a turn and the right-hand rule for its sense.</li><li>Fields of point charges, which add as vectors.</li><li>Complex numbers as arrows in a plane, where multiplying means turning.</li></ul>',
      '<p class="txt">The same tools run introductory mechanics and electromagnetism, so some of the examples come from there. Everything happens on a grid you can click, and the practice asks you to predict before the answer is shown.</p>'
    ].join(''),
    fig:{plane:true,scene:function(){return {plane:true,vectors:[{v:[2,1],cls:'ma',label:'a'},{v:[1,2],cls:'mb',label:'b'},{tail:[2,1],v:[1,2],cls:'mb'}],state:[3,3],stateLabel:'a + b'};},cap:'Two arrows and their sum. The grid is the plane this unit works in.'}},
  {id:'vectors',title:'Vectors: components, length and sum',
    html:[
      '<p class="txt">A vector is an arrow: a length and a direction. Its components say how far it reaches along each axis. The vector (3, 1) goes 3 to the right and 1 up. Where the arrow starts does not matter. Two arrows with the same components are the same vector.</p>',
      '<p class="txt">The components and the arrow form a right triangle, so the length comes from Pythagoras, and the angle θ from the +x axis gives the components back.</p>',
      '<p class="eq">length = √(x² + y²), x = length · cos θ, y = length · sin θ</p>',
      '<p class="txt">To add two vectors, add the components: (2, 1) + (1, 2) = (3, 3). On the figure, slide b so that its tail sits on the tip of a. The sum runs from the start of a to the tip of b. To subtract, add the reversed arrow: a − b = a + (−b). Multiplying by a number stretches the arrow, and a negative number also reverses it.</p>'
    ].join(''),
    fig:{plane:true,scene:function(){var v=[3,2];return {plane:true,vectors:[{v:v,cls:'ma'}],lines:[{a:v,b:[3,0]},{a:v,b:[0,2]}],arcs:[{a:0,b:v2ang(v),r:1,label:'θ'}],marks:[{p:[3,0],cls:'foot',label:'x',dy:14,dx:-3},{p:[0,2],cls:'foot',label:'y',dx:-14,dy:-4}]};},cap:'The vector (3, 2), its two components and its angle from the +x axis.'}},
  {id:'ex-add',kind:'Worked example',title:'Add two vectors',
    task:'a = (2, 1) and b = (−1, 2). Find a + b.',
    steps:[
      'Add the x components: 2 + (−1) = 1. Add the y components: 1 + 2 = 3. So a + b = (1, 3).',
      'On the figure: slide b so that its tail sits on the tip of a. Its tip lands at (1, 3).',
      'Check the answer. b leans left, so the sum should end to the left of a’s tip. It does, and it is higher, because both vectors point up.'
    ],
    fig:{plane:true,scene:function(){return {plane:true,vectors:[{v:[2,1],cls:'ma',label:'a'},{v:[-1,2],cls:'mb',label:'b'}]};},cap:'Press Play to slide b to the tip of a.',
      play:function(fig,done){fig.animateSlide([{v:[-1,2],from:[0,0],to:[2,1],cls:'mb',label:'b'}],function(){fig.vectors=[{v:[2,1],cls:'ma',label:'a'},{v:[-1,2],cls:'mb',label:'b'},{tail:[2,1],v:[-1,2],cls:'mb'}];fig.state=[1,3];fig.stateLabel='a + b';fig.draw();done();});}}},
  {id:'dot',title:'Dot product and projection',
    html:[
      '<p class="txt">The dot product of two vectors is a number.</p>',
      '<p class="eq">a · b = aₓ bₓ + aᵧ bᵧ = |a| |b| cos θ</p>',
      '<p class="txt">θ is the angle between the vectors. The dot product is positive when they lean the same way, zero when they are perpendicular, and negative when the angle is more than 90°. It gives the angle from the components: cos θ = a · b / (|a| |b|).</p>',
      '<p class="txt">The projection of a onto the direction of b is the shadow of a on the line through b. Drop a perpendicular from the tip of a to that line. The foot is the projection.</p>',
      '<p class="eq">projection of a onto b = (a · b / |b|²) b, component of a along b = a · b / |b|</p>',
      '<p class="txt">The component of a along b is the length of the projection, with a minus sign when the projection points against b. When b is a unit vector, it is simply a · b. In Unit 1 the probability of a measurement outcome comes from a projection of exactly this kind.</p>'
    ].join(''),
    fig:{plane:true,scene:function(){var a=[1,3],b=[3,1],p=v2proj(a,b);return {plane:true,vectors:[{v:a,cls:'ma',label:'a'},{v:b,cls:'mb',label:'b'}],lines:[{a:v2scale(v2unit(b),-1),b:v2scale(v2unit(b),4.3),cls:'thin'},{a:a,b:p}],marks:[{p:p,cls:'foot'}],arcs:[arcAB(b,a,0.9,'θ')]};},cap:'The projection of a onto b is the foot of the perpendicular from the tip of a to the line through b.'}},
  {id:'ex-proj',kind:'Worked example',title:'Project one vector onto another',
    task:'a = (3, 1) and b = (1, 1). Find the projection of a onto the direction of b.',
    steps:[
      'a · b = 3·1 + 1·1 = 4. |b|² = 1 + 1 = 2.',
      'The projection is (a · b / |b|²) b = (4/2)(1, 1) = (2, 2).',
      'Its length is a · b / |b| = 4/√2 = 2.83. That is the component of a along b.',
      'Check the answer. a − (2, 2) = (1, −1), and (1, −1) · (1, 1) = 0. What is left over is perpendicular to b, as it must be.'
    ],
    fig:{plane:true,scene:function(){return {plane:true,vectors:[{v:[3,1],cls:'ma',label:'a'},{v:[1,1],cls:'mb',label:'b'}],lines:[{a:[-1,-1],b:[4,4],cls:'thin'},{a:[3,1],b:[2,2]}],marks:[{p:[2,2],cls:'foot'}],state:[2,2]};},cap:'The projection (2, 2) and the perpendicular dropped from the tip of a.'}},
  {id:'cross',title:'Cross product and the right-hand rule',
    html:[
      '<p class="txt">The cross product of two vectors is a vector, perpendicular to both. Its size is the area of the parallelogram they span.</p>',
      '<p class="eq">|a × b| = |a| |b| sin θ</p>',
      '<p class="txt">Two directions are perpendicular to the plane of a and b. The right hand picks one: point the fingers along a, curl them toward b, and the thumb points along a × b. Swapping the order flips the result: b × a = −a × b. In components,</p>',
      '<p class="eq">a × b = (a<sub>y</sub>b<sub>z</sub> − a<sub>z</sub>b<sub>y</sub>, a<sub>z</sub>b<sub>x</sub> − a<sub>x</sub>b<sub>z</sub>, a<sub>x</sub>b<sub>y</sub> − a<sub>y</sub>b<sub>x</sub>)</p>',
      '<p class="txt">For two vectors in the xy plane only the last component survives, so a × b points along +z or −z.</p>',
      '<p class="txt">The cross product also describes turning. A turn about an axis n moves a point at v along a circle around the axis. The first motion of the point is along n × v. So the rule for the sense of a turn is the same right hand: thumb along the axis, fingers show the way points move. Unit 1 uses this rule for every gate.</p>'
    ].join(''),
    fig:{scene:function(){return {axes:'xyz',marks:[{v:[1,0,0],cls:'ma',vec:true,label:'a'},{v:[0,1,0],cls:'mb',vec:true,label:'b'}],guides:[{n:[0,0,1],h:0}],state:[0,0,1]};},cap:'a along +x, b along +y. a × b points along +z, out of their plane. Drag the figure to turn it.'}},
  {id:'ex-cross',kind:'Worked example',title:'Find a cross product',
    task:'a points along +y and b points along +x. Which way does a × b point?',
    steps:[
      'a × b is perpendicular to both a and b, so it lies along the z axis. Up or down?',
      'Right hand: fingers along +y, curl them toward +x. The thumb points down. So a × b points along −z.',
      'Check with the components. a = (0, 1, 0), b = (1, 0, 0). The z component is aₓ bᵧ − aᵧ bₓ = 0·0 − 1·1 = −1.',
      'The order matters: b × a, with fingers along +x curling toward +y, points along +z.'
    ],
    fig:{scene:function(){return {axes:'xyz',marks:[{v:[0,1,0],cls:'ma',vec:true,label:'a'},{v:[1,0,0],cls:'mb',vec:true,label:'b'}],guides:[{n:[0,0,1],h:0}],state:[0,0,-1]};},cap:'a along +y, b along +x. The result points down.'}},
  {id:'fields',title:'Fields add as vectors',
    html:[
      '<p class="txt">A point charge q makes an electric field at every point in space. The field is a vector: it points along the line from the charge, away from a positive charge and toward a negative one, and its size falls off as the inverse square of the distance.</p>',
      '<p class="eq">|E| = k |q| / r²</p>',
      '<p class="txt">With several charges, the field at a point is the vector sum of the fields each charge would make on its own. This is superposition. Find each field at the point, then add the arrows tip to tail. Two equal positive charges make no field at their midpoint, because the two arrows cancel.</p>',
      '<p class="txt">In the figures of this unit, k = 4 in the units of the grid, so a charge q at distance 2 makes a field of size 1.</p>'
    ].join(''),
    fig:{plane:true,scene:function(){var ch=[{p:[-1,0],q:1},{p:[1,0],q:-1}],P=[0,1],e1=fieldAt([ch[0]],P),e2=fieldAt([ch[1]],P);return {plane:true,anchor:P,marks:chargeMarks(ch).concat([{p:P,cls:'pt',label:'P',dx:7,dy:12}]),vectors:[{tail:P,v:e1,cls:'mb',label:'E1'},{tail:P,v:e2,cls:'mb',label:'E2'},{tail:v2add(P,e1),v:e2,cls:'mb'}],state:fieldAt(ch,P),stateLabel:'E'};},cap:'The fields of a positive and a negative charge at the point P, and their sum.'}},
  {id:'ex-field',kind:'Worked example',title:'Add the fields of two charges',
    task:'A charge +q sits at (−2, 0) and a charge +2q at (0, 2). Find the field at the origin, with k = 4.',
    steps:[
      'The charge +q is at distance 2. Its field has size 4·1/2² = 1 and points away from the charge, toward +x: E₁ = (1, 0).',
      'The charge +2q is also at distance 2. Its field has size 4·2/2² = 2 and points away from it, toward −y: E₂ = (0, −2).',
      'Add the arrows: E = (1, 0) + (0, −2) = (1, −2).',
      'Check the answer. The field should point away from both charges, so right and down. It does, and more down than right, because the charge above is twice as large.'
    ],
    fig:{plane:true,scene:function(){var ch=[{p:[-2,0],q:1},{p:[0,2],q:2}];return {plane:true,marks:chargeMarks(ch).concat([{p:[0,0],cls:'pt',label:'P',dx:7,dy:12}]),vectors:[{v:[1,0],cls:'mb',label:'E1'},{v:[0,-2],cls:'mb',label:'E2'}]};},cap:'Press Play to add the two fields.',
      play:function(fig,done){fig.animateSlide([{v:[0,-2],from:[0,0],to:[1,0],cls:'mb',label:'E2'}],function(){var ch=[{p:[-2,0],q:1},{p:[0,2],q:2}];fig.vectors=[{v:[1,0],cls:'mb',label:'E1'},{v:[0,-2],cls:'mb',label:'E2'},{tail:[1,0],v:[0,-2],cls:'mb'}];fig.state=[1,-2];fig.stateLabel='E';fig.draw();done();});}}},
  {id:'complex',title:'Complex numbers as arrows',
    html:[
      '<p class="txt">A complex number z = a + bi is a point in a plane: a along the real axis, b along the imaginary axis. So it is also an arrow from 0, with a length and an angle.</p>',
      '<p class="eq">|z| = √(a² + b²), z = r e<sup>iθ</sup> = r (cos θ + i sin θ)</p>',
      '<p class="txt">r is the length and θ the angle from the positive real axis, counterclockwise. The number e<sup>iθ</sup> alone has length 1: it is the point on the unit circle at angle θ. So e<sup>i·90°</sup> = i and e<sup>i·180°</sup> = −1.</p>',
      '<p class="txt">Multiplication is simple in this picture: lengths multiply and angles add. Multiplying by e<sup>iφ</sup> turns an arrow by φ without changing its length. Multiplying by i is a quarter turn, and i · i = −1 is a half turn. The conjugate z* = a − bi is the reflection of z in the real axis, and z z* = |z|².</p>',
      '<p class="txt">In Unit 1 the two amplitudes of a qubit are complex numbers. Their angles are the phases, and a phase gate multiplies an amplitude by e<sup>iφ</sup>.</p>'
    ].join(''),
    fig:{plane:true,scene:function(){var z=[2,1],iz=[-1,2];return {plane:true,axes:CAX,circle:true,vectors:[{v:z,cls:'ma',label:'z'},{v:iz,cls:'mb',label:'iz'}],arcs:[{a:0,b:v2ang(z),r:0.8,label:'θ'}]};},cap:'z = 2 + i and iz = −1 + 2i. Multiplying by i turns the arrow by 90°.'}},
  {id:'ex-complex',kind:'Worked example',title:'Multiply two complex numbers',
    task:'z = 1 + i. Find |z|, its angle, and z².',
    steps:[
      '|z| = √(1 + 1) = √2 = 1.41. The arrow points along the diagonal, so its angle is 45°: z = √2 e<sup>i·45°</sup>.',
      'For z², lengths multiply and angles add: length √2 · √2 = 2, angle 45° + 45° = 90°. So z² = 2e<sup>i·90°</sup> = 2i.',
      'Check in parts: (1 + i)(1 + i) = 1 + i + i + i² = 1 + 2i − 1 = 2i.'
    ],
    fig:{plane:true,scene:function(){return {plane:true,axes:CAX,circle:true,vectors:[{v:[1,1],cls:'ma',label:'z'}]};},cap:'Press Play to turn and stretch z into z².',
      play:function(fig,done){fig.animateFn(function(e){return {state:v2scale(v2rot([1,1],45*e),1+(Math.SQRT2-1)*e)};},reducedMotion()?0:900,function(){fig.state=[0,2];fig.stateLabel='z²';fig.draw();done();});}}},
  {id:'ahead',title:'What carries into Unit 1',wide:true,
    html:[
      '<ul class="plain">',
      '<li>The state of a qubit is a pair of complex amplitudes. Their angles are phases, and a phase gate turns an amplitude the way multiplying by e<sup>iφ</sup> turns an arrow.</li>',
      '<li>The state is drawn as an arrow on a sphere. The probability of a measurement outcome comes from the projection of that arrow onto the measurement axis.</li>',
      '<li>Every gate is a turn about an axis. The cross product and the right-hand rule say which way the state moves.</li>',
      '<li>A superposition of states adds amplitudes the way fields add: as vectors, component by component.</li>',
      '</ul>'
    ].join('')}
];

var DISCUSS0=[
  {id:'dV1',concept:'V1',title:'Two descriptions of one vector',src:'',
    stem:'One student describes a displacement as “length 5, at 53° above the +x axis”. Another describes it as “(3, 4)”. Are they describing the same vector?',
    scene:function(){return {plane:true,vectors:[{v:[3,4],cls:'ma'}],arcs:[{a:0,b:53.13,r:1,label:'53°'}],lines:[{a:[3,4],b:[3,0]},{a:[3,4],b:[0,4]}]};},
    options:[
      {t:'No: one description has a 5 in it and the other does not',
        from:'The numbers in the two descriptions are different, so the vectors must be different.',
        limit:'The numbers describe the same arrow in two ways. Length and angle are one pair of numbers, the components another. Pythagoras and the cosine and sine connect them.'},
      {t:'Only if the arrow starts at the origin',
        from:'A vector is often drawn from the origin, so its position seems to be part of it.',
        limit:'A vector has a length and a direction, and nothing else. Where it is drawn does not matter. (3, 4) drawn from (1, 1) is the same vector as (3, 4) drawn from the origin.'},
      {t:'Yes: 5 cos 53° = 3 and 5 sin 53° = 4, so both give the same arrow',ok:true,
        why:'A vector is fixed by its length and direction, or equally by its components. The two descriptions translate into each other: the components of a length-5 arrow at 53° are (5 cos 53°, 5 sin 53°) = (3, 4), and √(3² + 4²) = 5.'},
      {t:'No: (3, 4) has length 3 + 4 = 7',
        from:'The length seems to be the total of the components.',
        limit:'The components are the legs of a right triangle and the arrow is the hypotenuse. Its length is √(3² + 4²) = 5, not 7.'}
    ],
    more:'Write (−3, 4) as a length and an angle. Then check: is the angle 53°, −53° or 127°? Compare with a neighbour.'},
  {id:'dV2',concept:'V2',title:'How long is a sum?',src:'',
    stem:'a has length 3 and b has length 1. Nothing else is known. What can the length of a + b be?',
    scene:function(){return {plane:true,vectors:[{v:[3,0],cls:'ma',label:'a'},{tail:[3,0],v:[0.5,0.87],cls:'mb',label:'b'}],circle:false,arcs:[{c:[3,0],a:0,b:360,r:1}]};},
    options:[
      {t:'Exactly 4',
        from:'Adding two things of size 3 and 1 gives 4.',
        limit:'Lengths add only when the vectors point the same way. For any other angle b does not point along a, and the sum is shorter than 4.'},
      {t:'Anything from 2 to 4, depending on the angle between them',ok:true,
        why:'Put the tail of b on the tip of a. The tip of b can be anywhere on a circle of radius 1 around that point. The sum is longest, 4, when b points along a, and shortest, 2, when b points against it. Every length in between is possible.'},
      {t:'Anything from 0 to 4',
        from:'Two vectors can cancel, so the sum can be as small as zero.',
        limit:'Two vectors cancel only when they have the same length and point opposite ways. Here b is too short to cancel a. The shortest sum is 3 − 1 = 2.'},
      {t:'Exactly √10',
        from:'With Pythagoras, √(3² + 1²) = √10.',
        limit:'Pythagoras applies only when the two vectors are perpendicular, and the angle is not given. √10 is one of the possible lengths, not the only one.'}
    ],
    more:'For which angle between a and b is |a + b| = 3, the same as |a|? Sketch it, then work it out with the dot product.'},
  {id:'dP1',concept:'P1',title:'A negative dot product',src:'Barniol and Zavala 2014',
    stem:'For two vectors a and b, a · b is negative. What does that tell you?',
    scene:function(){return {plane:true,vectors:[{v:[3,1],cls:'ma',label:'a'},{v:[-2,2],cls:'mb',label:'b'}],arcs:[arcAB([3,1],[-2,2],0.9,'θ')]};},
    options:[
      {t:'The angle between them is more than 90°',ok:true,
        why:'a · b = |a| |b| cos θ. The lengths are positive, so the sign of the dot product is the sign of cos θ, which is negative exactly when θ is between 90° and 180°. The vectors lean away from each other.'},
      {t:'a · b is a vector, and it points opposite to b',
        from:'A product of two vectors should be a vector, and a minus sign means it points backwards.',
        limit:'The dot product is a number, not a vector. It has a sign but no direction. Its sign says whether the angle between a and b is below or above 90°.'},
      {t:'That is impossible: a product of two lengths is positive',
        from:'The dot product is a product, and lengths are never negative.',
        limit:'The dot product is a product of two lengths and a cosine. The cosine can be negative, so the dot product can be too.'},
      {t:'They point in exactly opposite directions',
        from:'Opposite vectors give a negative dot product.',
        limit:'They do, and then cos θ = −1. But any angle above 90° gives a negative value. Opposite directions are one case, not the only one.'}
    ],
    more:'Find two vectors with a · b = 0 that both have only positive components. Is that possible? Why or why not?'},
  {id:'dP2',concept:'P2',title:'Projecting a onto b, or b onto a',src:'',
    stem:'a and b are two vectors with a · b ≠ 0. Compare the projection of a onto b with the projection of b onto a. When do they have the same length?',
    scene:function(){var a=[3,1],b=[1,2];return {plane:true,vectors:[{v:a,cls:'ma',label:'a'},{v:b,cls:'mb',label:'b'}],lines:[{a:a,b:v2proj(a,b)},{a:b,b:v2proj(b,a)}],marks:[{p:v2proj(a,b),cls:'foot'},{p:v2proj(b,a),cls:'foot'}]};},
    options:[
      {t:'Always: the dot product is symmetric, a · b = b · a',
        from:'The dot product does not care about the order, so neither should the projection.',
        limit:'The dot product is symmetric, but the projection divides it by the length of the vector projected onto. a · b / |b| and a · b / |a| differ unless |a| = |b|.'},
      {t:'Never',
        from:'Projecting in the other direction is a different operation, so the results must differ.',
        limit:'The two lengths are a · b / |b| and a · b / |a|. If the two vectors have the same length, these are equal.'},
      {t:'Only when a and b are perpendicular',
        from:'Perpendicular vectors are the symmetric case.',
        limit:'When a and b are perpendicular both projections are zero, which is excluded here by a · b ≠ 0. For every other pair the lengths agree exactly when |a| = |b|.'},
      {t:'Only when a and b have the same length',ok:true,
        why:'The projection of a onto b has length a · b / |b|, and the projection of b onto a has length a · b / |a|. The numerators are the same, so the lengths agree exactly when |a| = |b|. In general the longer vector casts the longer shadow.'}
    ],
    more:'In the figure a = (3, 1) and b = (1, 2). Compute both projection lengths and check which is longer before you look at the feet of the perpendiculars.'},
  {id:'dX1',concept:'X1',title:'Swapping the order',src:'',
    stem:'How is b × a related to a × b?',
    scene:function(){return {axes:'xyz',marks:[{v:[1,0,0],cls:'ma',vec:true,label:'a'},{v:[0,1,0],cls:'mb',vec:true,label:'b'}],guides:[{n:[0,0,1],h:0}],state:[0,0,1]};},
    options:[
      {t:'They are the same vector',
        from:'Multiplication does not depend on the order, as with numbers and with the dot product.',
        limit:'The cross product does depend on the order. Curling the fingers from b toward a is the opposite turn, so the thumb points the other way. The component formula shows it too: every term changes sign.'},
      {t:'Same size, opposite direction',ok:true,
        why:'Both are perpendicular to the plane of a and b and both have size |a| |b| sin θ. The right hand decides the side: fingers along a curling toward b give one thumb direction, fingers along b curling toward a give the opposite one. So b × a = −a × b.'},
      {t:'They are perpendicular to each other',
        from:'Swapping the order gives a different vector, and different cross products seem to point in different directions.',
        limit:'Both lie on the one line perpendicular to the plane of a and b. There is no room for them to be perpendicular to each other. They are opposite.'},
      {t:'b × a is zero',
        from:'Reversing the order undoes the product.',
        limit:'A cross product is zero only when the two vectors are parallel. Reversing the order reverses the direction and keeps the size.'}
    ],
    more:'In Unit 1, Rx(90°) and Rx(−90°) carry a state in opposite senses about the same axis. Explain this with b × a = −a × b.'},
  {id:'dX2',concept:'X2',title:'Which way does it turn?',src:'',
    stem:'A positive turn about the +z axis: right thumb along +z, fingers give the sense. A point sits on the +y axis. In which direction does it start to move?',
    scene:function(){return {axes:'xyz',state:[0,1,0],hint:{axis:[0,0,1],sense:1}};},
    reveal:function(fig,done){fig.load({axes:'xyz',state:[0,1,0],ghost:[0,1,0],hint:{axis:[0,0,1],sense:1}});fig.animate([{from:[0,1,0],axis:[0,0,1],angle:90*DEG}],function(){fig.state=[-1,0,0];fig.draw();done();});},
    options:[
      {t:'Toward +x',
        from:'A turn about z moves points between the x and y axes, and +x is the axis next door.',
        limit:'The point does move between the x and y axes, but the sense matters. With the right thumb along +z the fingers curl from +y toward −x. Toward +x is the sense of a negative turn.'},
      {t:'Toward +z, the axis',
        from:'The turn is named after z, so it seems to push points toward z.',
        limit:'A turn never changes the distance of a point from its axis. The point moves on a circle around the z axis, staying in the xy plane.'},
      {t:'It does not move: it sits on an axis',
        from:'Points on an axis stay still under a turn.',
        limit:'Only points on the rotation axis stay still. The point is on the y axis, which is perpendicular to the z axis, so it moves on the full circle.'},
      {t:'Toward −x',ok:true,
        why:'The first motion of a point at v under a turn about n is along n × v. Here z × y = −x. With the thumb along +z, the fingers curl from +x to +y, then on to −x: a point at +y moves toward −x.'}
    ],
    more:'In Unit 1 the gate S is a quarter turn about +z. Use this rule to predict where S sends the state |+⟩, which sits on the +x axis, then check it in Unit 1.'},
  {id:'dF1',concept:'F1',title:'Two sides of one charge',src:'',
    stem:'Two points A and B sit at the same distance from a single positive charge, on opposite sides of it. How do the fields at A and B compare?',
    scene:function(){return {plane:true,marks:[{p:[0,0],cls:'plus',label:'q',dx:9,dy:-8},{p:[-2,0],cls:'pt',label:'A',dx:-14,dy:12},{p:[2,0],cls:'pt',label:'B',dx:7,dy:12}]};},
    options:[
      {t:'Same size, opposite directions',ok:true,
        why:'The field of a point charge has size k|q|/r², the same at the same distance, and points away from a positive charge along the line through it. At A that is one way along the line and at B the other way.'},
      {t:'Same size, same direction',
        from:'A field is pictured as a single direction, like a wind or a uniform field between plates.',
        limit:'The field of a point charge points away from the charge at every point, so its direction changes from place to place. On opposite sides of the charge it points opposite ways.'},
      {t:'Different sizes',
        from:'The two points are in different places, so the fields should differ.',
        limit:'The size depends only on the distance, and the distances are equal. Only the direction differs.'},
      {t:'Zero at both: the two fields cancel',
        from:'Two equal and opposite fields add to zero.',
        limit:'The fields at A and at B are at different points. Fields add only at one point. Each point has its own field, and neither is zero.'}
    ],
    more:'Replace the positive charge by a negative one. What changes at A and B, and what stays the same?'},
  {id:'dF2',concept:'F2',title:'Between two equal charges',src:'',
    stem:'Two equal positive charges sit at (−2, 0) and (2, 0). What is the field at the midpoint, the origin?',
    scene:function(){var ch=[{p:[-2,0],q:1},{p:[2,0],q:1}];return {plane:true,marks:chargeMarks(ch).concat([{p:[0,0],cls:'pt',label:'P',dx:7,dy:12}])};},
    options:[
      {t:'Twice the field of one charge, pointing to the right',
        from:'Two charges make twice the field of one.',
        limit:'Fields add as arrows, not as sizes. The left charge pushes to the right and the right charge pushes to the left. The two arrows cancel.'},
      {t:'Twice the field of one charge, pointing up',
        from:'The two fields along the line cancel, and what is left must go somewhere.',
        limit:'Nothing is left. Each field lies along the line through the charges, so neither has a component perpendicular to it. The sum is the zero vector, not an arrow in a new direction.'},
      {t:'Zero',ok:true,
        why:'Each charge makes a field of the same size at the midpoint, directed away from itself. The two arrows point in opposite directions and add to zero. A test charge placed there feels no net force.'},
      {t:'The same as the field of one charge',
        from:'The two fields are equal, so the total is just that field.',
        limit:'The two fields are equal in size but opposite in direction. Equal and opposite arrows add to zero.'}
    ],
    more:'Now make the right charge negative. Which way does the field at the midpoint point, and how large is it compared with the field of one charge alone?'},
  {id:'dC1',concept:'C1',title:'The length of e^(iφ)',src:'',
    stem:'φ is any real angle. What is |e^(iφ)|?',
    scene:function(){return {plane:true,axes:CAX,circle:true,vectors:[{v:[Math.cos(50*DEG),Math.sin(50*DEG)],cls:'ma',label:'e^(iφ)'}],arcs:[{a:0,b:50,r:0.6,label:'φ'}]};},
    options:[
      {t:'φ',
        from:'The angle is the only number in the expression, so the size must be φ.',
        limit:'φ is the angle of the arrow, not its length. e^(i·90°) = i has length 1, not 90.'},
      {t:'1, for every φ',ok:true,
        why:'e^(iφ) = cos φ + i sin φ, so |e^(iφ)|² = cos²φ + sin²φ = 1. The number sits on the unit circle at angle φ. Changing φ moves it around the circle and never changes its length. This is why a phase factor never changes a probability in Unit 1.'},
      {t:'cos φ',
        from:'The real part of e^(iφ) is cos φ.',
        limit:'cos φ is the real part, the shadow of the arrow on the real axis. The length of the arrow includes the imaginary part: √(cos²φ + sin²φ) = 1.'},
      {t:'It depends on φ: larger angles give larger numbers',
        from:'Exponentials grow with their argument.',
        limit:'A real exponential eˣ grows. An imaginary exponent does not change the length, only the angle. e^(iφ) stays on the unit circle for every φ.'}
    ],
    more:'What is |2e^(iφ)|? And |e^(iφ) + e^(iφ)|? Sketch both.'},
  {id:'dC2',concept:'C2',title:'Multiplying by i twice',src:'',
    stem:'Take a complex number z and multiply it by i, then by i again. Where is the arrow now?',
    scene:function(){return {plane:true,axes:CAX,vectors:[{v:[2,1],cls:'ma',label:'z'},{v:[-1,2],cls:'mb',label:'iz'}]};},
    reveal:function(fig,done){fig.load({plane:true,axes:CAX,vectors:[{v:[2,1],cls:'ma',label:'z'},{v:[-1,2],cls:'mb',label:'iz'}]});fig.animateFn(function(e){return {state:v2rot([2,1],180*e)};},reducedMotion()?0:900,function(){fig.state=[-2,-1];fig.stateLabel='i²z';fig.draw();done();});},
    options:[
      {t:'Back where it started',
        from:'Doing something twice undoes it, like two reflections.',
        limit:'A reflection undoes itself, a turn does not. Two quarter turns make a half turn. It takes four multiplications by i to come back: i⁴ = 1.'},
      {t:'Turned by 90°',
        from:'Multiplying by i turns the arrow by 90°, and i · i = i.',
        limit:'Each multiplication by i adds 90° to the angle. Two of them add 180°. And i · i is −1, not i.'},
      {t:'Twice as long, same direction',
        from:'Multiplying twice doubles the number.',
        limit:'Multiplying by i does not change the length: |i| = 1. It changes the angle, by 90° each time.'},
      {t:'Turned by 180°: it is now −z',ok:true,
        why:'Multiplying by i turns the arrow by 90° counterclockwise. Doing it twice turns it by 180°, which is the arrow reversed. In symbols, i · i = i² = −1, and −1 times z is −z.'}
    ],
    more:'What does multiplying by (1 + i) do to an arrow? Give the turn and the stretch, then check with z = 1.'}
];

var UNITS={
  u0:{id:'u0',n:'0',title:'Vectors, rotations and phase',groups:['V','P','X','F','C'],goals:GOALS0,intro:INTRO0,discuss:DISCUSS0,explore:'explore0',code:'code0',
    goalsLead:'Unit 0 has five goals. Every practice item and every discussion question belongs to one of them, so this page also shows where you stand.',
    prereq:'Sines, cosines and square roots. Everything else is introduced on the Start here page. If you already work with vectors and complex numbers, go straight to the practice: it will tell you quickly whether anything needs a second look.',
    startLead:'Read this once before the practice. It gives the pictures and formulas for each topic and one worked example for each. The practice then asks for the same steps with less and less help.',
    practiceIntro:'explains the pictures and formulas this unit uses and how the practice works.',
    figLabel:'A plane with a grid. Click to place your prediction.'},
  u1:{id:'u1',n:'1',title:'One qubit',groups:['S','G','M','O','N'],goals:GOALS,intro:INTRO,discuss:DISCUSS,explore:'explore',code:'code',
    goalsLead:'Unit 1 has eight goals. Every practice item and every discussion question belongs to one of them, so this page also shows where you stand.',
    prereq:'Sines and cosines, vectors with three components, and complex numbers in the form e^(iφ). Unit 0 covers these. No quantum mechanics is assumed. The Start here page gives the conventions this unit uses.',
    startLead:'Read this once before the practice. It gives the conventions for the sphere and one worked example for each topic. The practice then asks for the same steps with less and less help.',
    practiceIntro:'explains how to read the sphere and how the practice works.',
    figLabel:'Bloch sphere. Click to place your prediction. Drag to turn the view.'}
};
var UNIT_ORDER=['u0','u1'];
COURSE.units[0].open=true;COURSE.units[0].go='u0-goals';delete COURSE.units[0].plan;
