# CloudTraceViz: A Visualization Tool for Tracing Dynamic Usage of Cloud Computing Resources

## Abstract
This paper introduces CloudTraceViz, a visual analytic tool for analyzing the characteristics of modern cloud data centers. The goals of this tool are: 1) to fulfill a set of visual tasks on cloud computing retrieved from in-depth interviews with domain experts, 2) to visualize and monitor large real-world data in terms of both the number of profiles and number of time steps, and 3) to aid system administrator to trace and understand the causal relationship of multivariate data. To reach these goals, our system composes several interconnected visual components. The customized heatmap is used to capture the pattern of a single machine as well as a group of machines, the progressive rendering of parallel coordinate allows users to see the dynamic behavior of running task/job over time, the scatterplot matrices are used in conjunction with the parallel graph for anomaly extraction. The results on the Alibaba Cloud Trace dataset show that the visualization tools offer great support for users to have a high-level overview of a large dataset as well as understand the causal relations within multivariate data.

## Video demo
[![Everything Is AWESOME](https://raw.githubusercontent.com/Alex-Nguyen/CloudTraceViz/master/overview.PNG)](https://youtu.be/4NUMYGhPb4I)

## Application Demo
https://alex-nguyen.github.io/CloudTraceViz/home.html
