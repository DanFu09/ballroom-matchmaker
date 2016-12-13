import matplotlib.pyplot as plt
import numpy as np

for filenum in range(5):
    fin = open('scores_over_time2014_{}.txt'.format(filenum),'r')

    scores = []
    for line in fin:
        scores.append(line)

    font = {'size'   : 22}

    plt.rc('font', **font)

    plt.title("HBDT14: Cost of State vs Steps")
    plt.xlabel("Steps of Local Search")
    plt.ylabel("Cost of Current State")
    plt.plot(scores)
plt.show()