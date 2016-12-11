
### CSV Specifications

+ Line 1: |D|, D
  + The number of dances D, followed by a comma separated list of dance name, followed
   by its height sensitivity (1/0).
    
+ Line 2: |P|
  + The number of people P in the system
    
+ Lines 3-3+2|P|:
  + First line: *P*. Name, Height (integer in inches), Nonballroom dance experience
 (integer in years), lesson attendance (integer in lessons/week), weekly practice
 time (hours), past ballroom experience (1/0), number of dances to participate
 (integer *=|P.R|*).
  + Second line: *P.R*. There will be 3*|P.R| values in this line with dance (0-based
  index of dance as given in line 1), lead/follow/both (0,1,2 respectively), and
  partner name (or TBA if none given)

### Example
```
4, smooth, 1, standard, 1, latin, 0, rhythm, 0
4
Kevin Fei, 70, 0, 4, 5, 0, 3
0, 0, TBA, 1, 0, Alaina Richert, 2, 0, Laura Aravena
Alaina Richert, 68, 0, 4, 8, 0, 3
1, 1, Kevin Fei, 2, 2, TBA, 3, 1, Laura Aravena
Laura Aravena, 66, 4, 4, 10, 0, 4
0, 1, Dank Memes, 1, 2, TBA, 3, 0, Alaina Richert, 2, 1, Dank Memes
Dank Memes, 62, 1, 3, 4, 0, 4
0, 2, TBA, 1, 2, TBA, 2, 2, TBA, 3,2, TBA
```