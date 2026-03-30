package com.capg.jobportal.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Value("${rabbitmq.exchange}")
    private String exchange;

    @Value("${rabbitmq.queue}")
    private String queue;

    @Value("${rabbitmq.routing-key}")
    private String routingKey;

    // Declares the queue so it exists when the listener starts
    @Bean
    public Queue jobPostedQueue() {
        return new Queue(queue, true); // true = durable (survives restart)
    }

    // Declares the exchange
    @Bean
    public DirectExchange jobPortalExchange() {
        return new DirectExchange(exchange);
    }

    // Binds queue to exchange using routing key
    @Bean
    public Binding binding(Queue jobPostedQueue, DirectExchange jobPortalExchange) {
        return BindingBuilder
                .bind(jobPostedQueue)
                .to(jobPortalExchange)
                .with(routingKey);
    }

    // Needed to deserialize incoming JSON messages into JobPostedEvent
    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }
    
    @Value("${rabbitmq.applied.queue}")
    private String appliedQueue;

    @Value("${rabbitmq.applied.routing-key}")
    private String appliedRoutingKey;

    @Bean
    public Queue jobAppliedQueue() {
        return new Queue(appliedQueue, true);
    }

    @Bean
    public Binding appliedBinding(Queue jobAppliedQueue, DirectExchange jobPortalExchange) {
        return BindingBuilder
                .bind(jobAppliedQueue)
                .to(jobPortalExchange)
                .with(appliedRoutingKey);
    }
}