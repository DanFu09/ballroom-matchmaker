# Problem Description

Given some information about each person, match them up for some specified
number of styles and dances.

Info for each person: height (required), leader/follower/both preference 
(required), non-ballroom dance experience (years), lesson attendance
(lessons/week, required), weekly practice time (required, hours),
past ballroom experience (yes/no), preferences for other partners (list of 
people, optional)

Global setting: yes/no for making each dancer have a different partner for each
dance

Global setting: list of dances, whether height difference is important, define
H1 as tight height difference bound and H2 as lax height difference bound.

### This is now out of date, see the paper for details

### CSP:

Optimally, we put everyone in partnerships such that everyone gets their
preferred role for each dance that they request; we also wish to make sure that
everyone is partnered with people that they want, that there's a good height
match, and that people of similar dedication (some function of attendance,
practice time, and past dance experience). For dancers we are unable to pair,
we assign them TBA. 

If we can't find an optimal matching, we relax constraints in this order:
* Dedication/past experience
* Preferences for other partners (this probably won't have a huge effect)
* Height
* Leader/follower preference (but not for people who are already doing something
else for a different dance)
* Everyone has a different partner for each dance
* Everyone has a partner (this should only happen if there are an odd number)

### Variables/Domains:
+ Let us have the set of dances *D*. Each *d* in *D* has the attribute of being
heigh sensitive or not.
+ Let us have the set *L=*{lead, follow, both} for the role of the dancer in each partnership.
+ Let us have the set of people *P*. Each *p* in *P* has attributes dance
preferences, height, non-ballroom dance experience
(years), lesson attendance (lessons/week), weekly practice time (hours), and past 
ballroom experience (yes/no).
  + Dance Preferences is a set *R=*{*(d,l,q)*} for *d* in *D* representing *p*'s
 desire to dance *d*, *l* in *L* the desired role in the partnership, and *q* in *P*
 being the desired partner. If the dancer does not have a desired partner, we will
 assign *q* to TBA (see below).
  + *P* includes a special value TBA who has
 *TBA.R=*{*(d,l,q)* | *d* in *D*, *l=*both, *q=*TBA}.
+ Let *Q* be the subset of *P* times *D* such that *Q=*{*(p,d)* | *(d,l)* in *p.R* for
+ some *l* in *L*}. This set represents the (person, dance) tuples we wish to assign.

Each (person, dance) tuple is a variable, that is *(p,d)* in Q. Each variable is assigned
another dancer, *(q,d,l)* in *Q* times *L*, where *p* refers to the partner, *d* is the
dance, and *l* is what role *p* will have in the partnership.

### Constraints:
Everyone has exactly one partner: each *(p, d)* pair in *Q* must be assigned to
exactly one other pair. The special value TBA is not used unless necessary
(formally, we do not include TBA in *P* until we have no other choice).  This
constraint cannot be relaxed (i.e., everyone must have a partner, and at most
one person can be TBA'd).

Everyone has a different partner: if two people *p* and *q* are paired for some
dance *d*, they cannot be paired for any other dance.

Leader/follower preference: for each *(p, d)* in *Q*, we define a preference
to be the triple *(p, d, l)*, where *l* can be one of leader, follower, or both.
*(p, d)* must be assigned to *(q, d)* such that both *p* and *q* dance their
preferred role.  The first-order relaxation of this constraint is that a dancer
can dance a role other than their preferred role for exactly one dance.  The
second-order relaxation of this constraint is that anyone can dance a role other
than their preferred role.

Height: Two dancers should have similar heights. This is more important in some
dances than othes. Take some pair *(p,d)* assigned *(q,d,l)*. For a height
sensistive dance, then we have that if *l=*lead, then *p.height* in
*[q.height,q.height+H1]* and if *l=*follow, then *p.height* in *[q.height-H1,q.height]*.
For a non height sensitive dance, we have *p.height* in *[q.height-H2,q.height+H2]*.
H1 and H2 are definied globally.

Partner preference: Dancers specify their partner preference in *p.R*. We process
this information in the form of a triple *(p, d, q)*, where *p* is the dancer
specifying the preference, and *q* is a normal member of *P*. If both triples *(p, d, q)*
and *(q, d, p)* exist for some *p* and *q*, we require that *p* and *q* be partnered
for dance *d*.  If multiple such matches exist, we pick one randomly.  We ignore
one-sided partner preferences.

Dedication/past experience: For each *(p, d)* paired with *(q, d)*, *p* and *q*
should have the same past ballroom experience, lesson attendance, and weekly
practice time.  If this constraint cannot be satisfied, we relax each constraint
such that dancers in adjacent categories (e.g. one who practices *2-3* hours, 
and one who practices *4-5* hours) can be paired.  If the constraint still
fails, we ignore it.