
### CSV Specifications

+ Line 1: |D|, D
  + Semi-colon separated: the number of dances D, followed by a list of dance 
   name, followed by its height sensitivity (1/0).
    
+ Line 2: |P|
  + The number of people P in the system
    
+ Lines 3 to 3+|P|:
  + Tab separated list of name, e-mail, height (in inches), comma-separated list
of dances they want to dance, lead/follow/both preference (one for all dances),
time spent dancing (integer in hours/week), lessons attended, ballroom experience (years), non-ballroom
experience (years), comma-separated list of people they don't
want to dance with, and then comma-separated lists of people they do want to
dance with for each dance (in the order given in line one)

### Example
```
4;smooth;1;standard;1;latin;0;rhythm;0;
4;
Kevin Fei;kevinfei@email;70;smooth,standard,rhythm;lead;3;10;0;1;Laura Aravena;Alaina Richert;Alaina Richert;;Alaina Richert;
Alaina Richert;alainaemail@com;68;smooth,standard,rhythm;follow;5;5;0;0;;Kevin Fei;Kevin Fei;;Dank Memes;
Laura Aravena;laura@laura.com;66;smooth,standard,latin,rhythm;follow;4;10;0;4;Kevin Fei;Dank Memes;Dank Memes;Dank Memes;;
Dank Memes;haha@rnc.com;62;latin,rhythm;lead;2;7;0;0;;;;Laura Aravena;Alaina Richert
```

{
    Kevin Fei: {
        height: 9
        experience: 
        blah: blah
        preferences: {
            smooth: [Alaina, Laura, My Mom],
            ...
            none: [my dad]
        }
    }
}

matching dictionary:

{
    latin: [[0, 2], [4, 3], ... [5,-1]]
    standard: []
    rhythm:
    smooth:
}

-1 is TBA

var sample_matching = {
      latin: [[0, 2], [4, 3], [5,-1]],
      standard: [[1, 2], [3, 4]]
    };
var sample_names = ["latin", "standard"];
matching_score(sample_matching, sample_names);

scores:
everyone has a partner: if person A is matched with TBA, cost is 1000 / (# of non-TBA partners)
everyone has a different partner: for every partnership, cost is 50 * (# of dances they dance together - 1)
    Effectively this means that for a partner, it is equal to 50 * (# of dances they dance with partner)^2
leader/follow preference: cost is 50 * (# of dances with opposite preference)
    Effectively this means that for a partner, it is equal to 50 * (# of dances they dance in the opp role)^2
Partner Lead/follow preference: cost is 10 * (# of dances with partner opposite preference) * (# of dances / # of their dances)
    
height difference: For height sensitive dances; -10 if leader is 4-5 inches, 0 if 2-7 inches, +10 if leader is outside that range
Partner Preferences: -30 if matched correctly (two ways)! +50 if someone is matched with someone they dislike
dedication/past experience: -2 if everything is matched correctly
